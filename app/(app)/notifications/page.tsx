import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { requireMembership } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { Notification } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { markAllRead, markNotificationRead } from "@/actions/notifications";

export const metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const ctx = await requireMembership();
  await connectDb();
  const items = await Notification.find({
    householdId: ctx.householdId,
    userId: ctx.userId,
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const unread = items.filter((i) => !i.readAt).length;

  return (
    <div className="container max-w-3xl space-y-5 py-6">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up."}
        action={
          unread > 0 ? (
            <form action={markAllRead}>
              <Button variant="outline" size="sm">
                <CheckCheck className="h-4 w-4" /> Mark all read
              </Button>
            </form>
          ) : null
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll see task, meal, and inventory alerts here."
        />
      ) : (
        <Card>
          <ul className="divide-y">
            {items.map((n) => (
              <li key={String(n._id)} className="flex items-start gap-3 p-4">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    n.readAt ? "bg-transparent" : "bg-primary"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-medium">{n.title}</span>
                    {!n.readAt && <Badge variant="secondary">New</Badge>}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelative(n.createdAt)}
                    </span>
                  </div>
                  {n.body && (
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    {n.href && (
                      <Button asChild variant="link" size="sm" className="h-auto p-0">
                        <Link href={n.href}>Open</Link>
                      </Button>
                    )}
                    {!n.readAt && (
                      <form action={markNotificationRead}>
                        <input type="hidden" name="id" value={String(n._id)} />
                        <Button type="submit" variant="ghost" size="sm">
                          Mark read
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
