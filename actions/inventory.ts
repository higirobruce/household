"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import {
  ActivityLog,
  HouseholdMembership,
  InventoryItem,
  Notification,
} from "@/lib/models";
import { requireMembership, requireRole } from "@/lib/auth/guards";
import { INVENTORY_CATEGORIES, NOTIFICATION_TYPES, ROLES } from "@/lib/constants";

const HISTORY_LIMIT = 20;
const ObjectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: "Invalid id" });

const CreateItemSchema = z.object({
  name: z.string().trim().min(1).max(80),
  category: z.enum(INVENTORY_CATEGORIES),
  unit: z.string().trim().min(1).max(16).default("unit"),
  quantity: z.coerce.number().min(0).max(1_000_000),
  minQuantity: z.coerce.number().min(0).max(1_000_000),
});

export async function createInventoryItem(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const parsed = CreateItemSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    unit: formData.get("unit") || "unit",
    quantity: formData.get("quantity") ?? 0,
    minQuantity: formData.get("minQuantity") ?? 1,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDb();
  try {
    const item = await InventoryItem.create({
      householdId: ctx.householdId,
      ...parsed.data,
      history: [
        {
          delta: parsed.data.quantity,
          quantityAfter: parsed.data.quantity,
          byUserId: ctx.userId,
          note: "Initial stock",
          at: new Date(),
        },
      ],
    });
    await ActivityLog.create({
      householdId: ctx.householdId,
      actorId: ctx.userId,
      action: "inventory.created",
      target: { kind: "inventory", id: item._id },
    });
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000) {
      return { ok: false as const, error: "An item with that name already exists" };
    }
    throw e;
  }

  revalidatePath("/inventory");
  return { ok: true as const };
}

const AdjustSchema = z.object({
  itemId: ObjectId,
  delta: z.coerce.number().int().min(-1_000_000).max(1_000_000),
  note: z.string().trim().max(200).optional(),
});

export async function adjustInventory(formData: FormData) {
  const ctx = await requireMembership();
  const parsed = AdjustSchema.safeParse({
    itemId: formData.get("itemId"),
    delta: formData.get("delta"),
    note: formData.get("note") ?? undefined,
  });
  if (!parsed.success) return;
  if (parsed.data.delta === 0) return;

  await connectDb();
  const item = await InventoryItem.findOne({
    _id: parsed.data.itemId,
    householdId: ctx.householdId,
  });
  if (!item) return;

  const next = Math.max(0, item.quantity + parsed.data.delta);
  const crossed = item.quantity > item.minQuantity && next <= item.minQuantity;

  item.quantity = next;
  item.history.unshift({
    delta: parsed.data.delta,
    quantityAfter: next,
    byUserId: ctx.userId as unknown as mongoose.Types.ObjectId,
    note: parsed.data.note,
    at: new Date(),
  } as never);
  if (item.history.length > HISTORY_LIMIT) item.history.length = HISTORY_LIMIT;
  await item.save();

  await ActivityLog.create({
    householdId: ctx.householdId,
    actorId: ctx.userId,
    action: "inventory.adjusted",
    target: { kind: "inventory", id: item._id },
    meta: { delta: parsed.data.delta, after: next },
  });

  if (crossed) {
    const homeowners = await HouseholdMembership.find({
      householdId: ctx.householdId,
      role: ROLES.HOMEOWNER,
      status: "active",
    })
      .select("userId")
      .lean();
    if (homeowners.length) {
      await Notification.insertMany(
        homeowners.map((m) => ({
          householdId: ctx.householdId,
          userId: m.userId,
          type: NOTIFICATION_TYPES.INVENTORY_LOW,
          title: `${item.name} is low`,
          body: `Only ${next} ${item.unit} left.`,
          href: "/inventory",
        }))
      );
    }
  }

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
}

export async function deleteInventoryItem(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const itemId = String(formData.get("itemId") ?? "");
  if (!mongoose.Types.ObjectId.isValid(itemId)) return;
  await connectDb();
  await InventoryItem.deleteOne({ _id: itemId, householdId: ctx.householdId });
  revalidatePath("/inventory");
}
