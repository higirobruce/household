import { requireRole } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { HouseholdMembership, User } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { TaskForm } from "./task-form";
import { ROLES } from "@/lib/constants";

export const metadata = { title: "New task" };

export default async function NewTaskPage() {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  await connectDb();
  const memberships = await HouseholdMembership.find({
    householdId: ctx.householdId,
    status: "active",
  })
    .select("userId role")
    .lean();
  const users = await User.find({ _id: { $in: memberships.map((m) => m.userId) } })
    .select("_id name")
    .lean();

  const members = users.map((u) => ({ id: String(u._id), name: u.name }));

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      <PageHeader title="New task" description="Assign work to someone in your household." />
      <Card>
        <CardContent className="pt-6">
          <TaskForm members={members} />
        </CardContent>
      </Card>
    </div>
  );
}
