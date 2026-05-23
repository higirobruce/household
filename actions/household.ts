"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDb } from "@/lib/db/mongoose";
import { ActivityLog, Household, HouseholdMembership, Notification, User } from "@/lib/models";
import { readSession, setSessionCookie } from "@/lib/auth/session";
import { requireMembership, requireRole } from "@/lib/auth/guards";
import { ROLES, NOTIFICATION_TYPES } from "@/lib/constants";
import { hashPassword } from "@/lib/auth/password";

const CreateHouseholdSchema = z.object({
  name: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(1).max(64).optional(),
});

export async function createHousehold(_prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const session = await readSession();
  if (!session) redirect("/login");

  const parsed = CreateHouseholdSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDb();
  const household = await Household.create({
    name: parsed.data.name,
    ownerId: session.userId,
    settings: { timezone: parsed.data.timezone || "UTC", lowStockThreshold: 1 },
  });

  await HouseholdMembership.create({
    householdId: household._id,
    userId: session.userId,
    role: ROLES.HOMEOWNER,
    status: "active",
    joinedAt: new Date(),
  });

  await User.updateOne({ _id: session.userId }, { defaultHouseholdId: household._id });

  await ActivityLog.create({
    householdId: household._id,
    actorId: session.userId,
    action: "household.created",
    target: { kind: "household", id: household._id },
  });

  await setSessionCookie({ userId: session.userId, householdId: String(household._id) });
  redirect("/dashboard");
}

const InviteSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(120),
  role: z.enum([ROLES.HOMEOWNER, ROLES.STAFF]),
});

/**
 * MVP invite: the homeowner provisions an account for the new member directly
 * with a temporary password they share out-of-band. In a future iteration this
 * becomes an email link with token-based acceptance.
 */
export async function inviteMember(
  _prev: { ok: boolean; error?: string } | null,
  formData: FormData
) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const parsed = InviteSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDb();
  let user = await User.findOne({ email: parsed.data.email });
  if (!user) {
    user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    });
  }

  const existing = await HouseholdMembership.findOne({
    householdId: ctx.householdId,
    userId: user._id,
  });
  if (existing && existing.status === "active") {
    return { ok: false as const, error: "That person is already a member" };
  }

  if (existing) {
    existing.status = "active";
    existing.role = parsed.data.role;
    existing.joinedAt = new Date();
    await existing.save();
  } else {
    await HouseholdMembership.create({
      householdId: ctx.householdId,
      userId: user._id,
      role: parsed.data.role,
      status: "active",
      invitedBy: ctx.userId,
      invitedAt: new Date(),
      joinedAt: new Date(),
    });
  }

  await Notification.create({
    householdId: ctx.householdId,
    userId: user._id,
    type: NOTIFICATION_TYPES.HOUSEHOLD_INVITE,
    title: "You were added to a household",
    body: `Sign in with ${parsed.data.email} to get started.`,
    href: "/dashboard",
  });

  await ActivityLog.create({
    householdId: ctx.householdId,
    actorId: ctx.userId,
    action: "member.invited",
    target: { kind: "user", id: user._id },
    meta: { role: parsed.data.role },
  });

  revalidatePath("/staff");
  return { ok: true as const };
}

export async function removeMember(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === ctx.userId) return;
  await connectDb();
  await HouseholdMembership.updateOne(
    { householdId: ctx.householdId, userId },
    { status: "removed" }
  );
  revalidatePath("/staff");
}

const UpdateHouseholdSchema = z.object({
  name: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(1).max(64),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000),
});

export async function updateHouseholdSettings(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const parsed = UpdateHouseholdSchema.safeParse({
    name: formData.get("name"),
    timezone: formData.get("timezone"),
    lowStockThreshold: formData.get("lowStockThreshold"),
  });
  if (!parsed.success) return;
  await connectDb();
  await Household.updateOne(
    { _id: ctx.householdId },
    {
      name: parsed.data.name,
      "settings.timezone": parsed.data.timezone,
      "settings.lowStockThreshold": parsed.data.lowStockThreshold,
    }
  );
  revalidatePath("/settings");
}
