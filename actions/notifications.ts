"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models";
import { requireMembership } from "@/lib/auth/guards";

export async function markNotificationRead(formData: FormData) {
  const ctx = await requireMembership();
  const id = String(formData.get("id") ?? "");
  if (!mongoose.Types.ObjectId.isValid(id)) return;
  await connectDb();
  await Notification.updateOne(
    { _id: id, userId: ctx.userId, householdId: ctx.householdId },
    { readAt: new Date() }
  );
  revalidatePath("/notifications");
}

export async function markAllRead() {
  const ctx = await requireMembership();
  await connectDb();
  await Notification.updateMany(
    { userId: ctx.userId, householdId: ctx.householdId, readAt: null },
    { readAt: new Date() }
  );
  revalidatePath("/notifications");
}
