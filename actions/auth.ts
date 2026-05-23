"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDb } from "@/lib/db/mongoose";
import { User, HouseholdMembership } from "@/lib/models";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  clearSessionCookie,
  readSession,
  setSessionCookie,
} from "@/lib/auth/session";

const RegisterSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(120),
});

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function register(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDb();
  const existing = await User.findOne({ email: parsed.data.email }).lean();
  if (existing) return { ok: false, error: "An account with that email already exists" };

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });

  await setSessionCookie({ userId: String(user._id) });
  redirect("/onboarding");
}

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Enter a valid email and password" };

  await connectDb();
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash").lean();
  if (!user) return { ok: false, error: "Invalid email or password" };

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) return { ok: false, error: "Invalid email or password" };

  // Pick a household: prefer default, else first active membership.
  let householdId: string | undefined;
  if (user.defaultHouseholdId) {
    const m = await HouseholdMembership.findOne({
      userId: user._id,
      householdId: user.defaultHouseholdId,
      status: "active",
    }).lean();
    if (m) householdId = String(m.householdId);
  }
  if (!householdId) {
    const m = await HouseholdMembership.findOne({ userId: user._id, status: "active" }).lean();
    if (m) householdId = String(m.householdId);
  }

  await setSessionCookie({ userId: String(user._id), householdId });
  redirect(householdId ? "/dashboard" : "/onboarding");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}

export async function switchHousehold(householdId: string) {
  const session = await readSession();
  if (!session) redirect("/login");
  await connectDb();
  const m = await HouseholdMembership.findOne({
    userId: session.userId,
    householdId,
    status: "active",
  }).lean();
  if (!m) redirect("/dashboard");
  await setSessionCookie({ userId: session.userId, householdId: String(m.householdId) });
  redirect("/dashboard");
}
