import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { requireMembership } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { HouseholdMembership, Task, User } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";
import { ROLES, TASK_STATUS, type TaskStatus } from "@/lib/constants";

export const metadata = { title: "Tasks" };
export const dynamic = "force-dynamic";

type SearchParams = { status?: string };

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const ctx = await requireMembership();
  const sp = await searchParams;
  const filterStatus = isStatus(sp.status) ? sp.status : undefined;

  await connectDb();

  const baseFilter: Record<string, unknown> = { householdId: ctx.householdId };
  if (ctx.role === ROLES.STAFF) baseFilter.assigneeId = ctx.userId;
  if (filterStatus) baseFilter.status = filterStatus;

  const tasks = await Task.find(baseFilter)
    .sort({ status: 1, dueAt: 1, createdAt: -1 })
    .limit(100)
    .lean();

  // Hydrate assignees in one query
  const assigneeIds = Array.from(
    new Set(tasks.map((t) => t.assigneeId && String(t.assigneeId)).filter(Boolean) as string[])
  );
  const assignees = assigneeIds.length
    ? await User.find({ _id: { $in: assigneeIds } })
        .select("_id name")
        .lean()
    : [];
  const assigneeMap = new Map(assignees.map((u) => [String(u._id), u.name]));

  return (
    <div className="container max-w-4xl space-y-5 py-6">
      <PageHeader
        title="Tasks"
        description={ctx.role === ROLES.STAFF ? "Your assigned work." : "All household tasks."}
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

      <FilterTabs current={filterStatus} />

      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          description={
            ctx.role === ROLES.HOMEOWNER
              ? "Create your first task to start coordinating."
              : "No tasks assigned to you right now."
          }
          action={
            ctx.role === ROLES.HOMEOWNER ? (
              <Button asChild>
                <Link href="/tasks/new">Create a task</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <Card>
          <ul className="divide-y">
            {tasks.map((t) => (
              <li key={String(t._id)}>
                <Link
                  href={`/tasks/${t._id}`}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-accent/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {t.dueAt && <span>Due {formatRelative(t.dueAt)}</span>}
                      {t.assigneeId && (
                        <span className="inline-flex items-center gap-1.5">
                          <Avatar
                            name={assigneeMap.get(String(t.assigneeId)) ?? "?"}
                            size={18}
                          />
                          {assigneeMap.get(String(t.assigneeId)) ?? "Unknown"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5 sm:flex-row sm:items-center">
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function isStatus(s: unknown): s is TaskStatus {
  return s === TASK_STATUS.PENDING || s === TASK_STATUS.IN_PROGRESS || s === TASK_STATUS.COMPLETED;
}

function FilterTabs({ current }: { current?: TaskStatus }) {
  const tabs: { label: string; value?: TaskStatus }[] = [
    { label: "All" },
    { label: "Pending", value: TASK_STATUS.PENDING },
    { label: "In progress", value: TASK_STATUS.IN_PROGRESS },
    { label: "Completed", value: TASK_STATUS.COMPLETED },
  ];
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
      {tabs.map((t) => {
        const active = (t.value ?? undefined) === current;
        const href = t.value ? `/tasks?status=${t.value}` : "/tasks";
        return (
          <Link
            key={t.label}
            href={href}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (active
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
