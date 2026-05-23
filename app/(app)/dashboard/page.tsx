import Link from "next/link";
import { ArrowRight, ClipboardList, Plus, UtensilsCrossed, AlertTriangle } from "lucide-react";
import { requireMembership } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { InventoryItem, Meal, Task } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { isoDay, formatRelative } from "@/lib/utils";
import { ROLES, TASK_STATUS } from "@/lib/constants";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await requireMembership();
  await connectDb();

  const today = isoDay(new Date());

  const taskFilter =
    ctx.role === ROLES.STAFF
      ? { householdId: ctx.householdId, assigneeId: ctx.userId, status: { $ne: TASK_STATUS.COMPLETED } }
      : { householdId: ctx.householdId, status: { $ne: TASK_STATUS.COMPLETED } };

  const [openTasks, todaysMeals, lowStock, completedToday] = await Promise.all([
    Task.find(taskFilter).sort({ dueAt: 1, createdAt: -1 }).limit(5).lean(),
    Meal.find({ householdId: ctx.householdId, date: today }).sort({ slot: 1 }).lean(),
    InventoryItem.find({
      householdId: ctx.householdId,
      $expr: { $lte: ["$quantity", "$minQuantity"] },
    })
      .limit(5)
      .lean(),
    Task.countDocuments({
      householdId: ctx.householdId,
      status: TASK_STATUS.COMPLETED,
      completedAt: { $gte: new Date(today + "T00:00:00.000Z") },
    }),
  ]);

  const greeting =
    ctx.role === ROLES.HOMEOWNER
      ? `Good day, ${ctx.user.name.split(" ")[0]}.`
      : `Hi ${ctx.user.name.split(" ")[0]} — here’s your day.`;

  return (
    <div className="container max-w-5xl space-y-6 py-6">
      <PageHeader
        title={greeting}
        description={
          ctx.role === ROLES.HOMEOWNER
            ? "A snapshot of what's happening today."
            : "Focus on what needs doing today."
        }
        action={
          ctx.role === ROLES.HOMEOWNER ? (
            <Button asChild>
              <Link href="/tasks/new">
                <Plus className="h-4 w-4" /> New task
              </Link>
            </Button>
          ) : null
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Open tasks" value={openTasks.length} href="/tasks" icon={ClipboardList} />
        <StatCard label="Completed today" value={completedToday} href="/tasks" />
        <StatCard
          label="Low-stock items"
          value={lowStock.length}
          href="/inventory"
          icon={AlertTriangle}
          tone={lowStock.length > 0 ? "warning" : "default"}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Open tasks</CardTitle>
              <CardDescription>What needs attention.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/tasks">
                See all <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {openTasks.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="Nothing on the list"
                description="You&apos;re all caught up."
              />
            ) : (
              <ul className="divide-y">
                {openTasks.map((t) => (
                  <li key={String(t._id)}>
                    <Link
                      href={`/tasks/${t._id}`}
                      className="flex items-start justify-between gap-3 py-3 hover:bg-accent/30"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t.dueAt ? `Due ${formatRelative(t.dueAt)}` : "No due date"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <PriorityBadge priority={t.priority} />
                        <StatusBadge status={t.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Today&apos;s meals</CardTitle>
              <CardDescription>What&apos;s on the menu.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/meals">
                Plan <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaysMeals.length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="No meals planned"
                description="Add this week&apos;s plan."
              />
            ) : (
              <ul className="space-y-3">
                {todaysMeals.map((m) => (
                  <li key={String(m._id)} className="rounded-lg border bg-card/50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {m.slot}
                    </p>
                    <p className="text-sm font-medium">{m.name}</p>
                    {m.instructions && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {m.instructions}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      {lowStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" /> Low stock
            </CardTitle>
            <CardDescription>These items are at or below their minimum.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStock.map((i) => (
                <li
                  key={String(i._id)}
                  className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <span className="font-medium">{i.name}</span>
                  <span className="text-muted-foreground">
                    {i.quantity} {i.unit}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warning";
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {Icon && (
          <Icon
            className={
              tone === "warning"
                ? "h-4 w-4 text-warning"
                : "h-4 w-4 text-muted-foreground"
            }
          />
        )}
      </div>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </Link>
  );
}
