import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import { connectDb } from "@/lib/db/mongoose";
import { Household, HouseholdMembership, User } from "@/lib/models";
import { SideNav } from "@/components/app/side-nav";
import { BottomNav } from "@/components/app/bottom-nav";
import { TopBar } from "@/components/app/top-bar";
import type { Role } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session) redirect("/login");

  await connectDb();
  const user = await User.findById(session.userId).lean();
  if (!user) redirect("/login");

  // Onboarding has no household yet — render bare so the onboarding form shows.
  if (!session.householdId) {
    return <main className="min-h-dvh">{children}</main>;
  }

  const [membership, household] = await Promise.all([
    HouseholdMembership.findOne({
      userId: session.userId,
      householdId: session.householdId,
      status: "active",
    }).lean(),
    Household.findById(session.householdId).lean(),
  ]);

  if (!membership || !household) redirect("/onboarding");

  const role = membership.role as Role;
  const safeUser = { id: String(user._id), name: user.name, email: user.email };

  return (
    <div className="flex min-h-dvh">
      <SideNav role={role} householdName={household.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={safeUser} householdName={household.name} />
        <main className="flex-1 pb-20 md:pb-8">{children}</main>
        <BottomNav role={role} />
      </div>
    </div>
  );
}
