import { UsersRound } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { HouseholdMembership, User } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants";
import { InviteDrawer } from "./invite-drawer";
import { removeMember } from "@/actions/household";

export const metadata = { title: "Staff" };
export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  await connectDb();

  const memberships = await HouseholdMembership.find({
    householdId: ctx.householdId,
    status: "active",
  })
    .sort({ role: 1, joinedAt: 1 })
    .lean();

  const users = await User.find({ _id: { $in: memberships.map((m) => m.userId) } })
    .select("_id name email")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  return (
    <div className="container max-w-3xl space-y-5 py-6">
      <PageHeader
        title="Household members"
        description="Invite homeowners and staff. Roles control what they can do."
        action={<InviteDrawer />}
      />

      {memberships.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No members yet"
          description="Invite your first household member."
        />
      ) : (
        <Card>
          <ul className="divide-y">
            {memberships.map((m) => {
              const u = userMap.get(String(m.userId));
              if (!u) return null;
              const self = String(m.userId) === ctx.userId;
              return (
                <li key={String(m._id)} className="flex items-center gap-3 p-4">
                  <Avatar name={u.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{u.name}</span>
                      {self && <Badge variant="muted">You</Badge>}
                      <Badge
                        variant={m.role === ROLES.HOMEOWNER ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {m.role}
                      </Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {!self && (
                    <form action={removeMember}>
                      <input type="hidden" name="userId" value={String(m.userId)} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </form>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
