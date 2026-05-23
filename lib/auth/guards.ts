import { redirect } from "next/navigation";
import { readSession } from "./session";
import { connectDb } from "@/lib/db/mongoose";
import { HouseholdMembership, User } from "@/lib/models";
import type { Role } from "@/lib/constants";

export type AuthContext = {
  userId: string;
  user: { id: string; name: string; email: string };
  householdId: string;
  role: Role;
};

/** Require a logged-in user. Redirect to /login if missing. */
export async function requireUser() {
  const session = await readSession();
  if (!session) redirect("/login");
  await connectDb();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");
  return {
    session,
    user: { id: String(user._id), name: user.name, email: user.email },
  };
}

/**
 * Require an authenticated user with an active household membership.
 * Redirects unauthenticated users to /login and authenticated users
 * without a household to /onboarding.
 */
export async function requireMembership(): Promise<AuthContext> {
  const { user, session } = await requireUser();
  if (!session.householdId) redirect("/onboarding");
  await connectDb();
  const m = await HouseholdMembership.findOne({
    userId: user.id,
    householdId: session.householdId,
    status: "active",
  }).lean();
  if (!m) redirect("/onboarding");
  return {
    userId: user.id,
    user,
    householdId: String(m.householdId),
    role: m.role as Role,
  };
}

export async function requireRole(role: Role): Promise<AuthContext> {
  const ctx = await requireMembership();
  if (ctx.role !== role) redirect("/dashboard");
  return ctx;
}
