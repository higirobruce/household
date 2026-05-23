import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireMembership } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { Task, TaskComment, User } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatusBadge, PriorityBadge } from "@/components/ui/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate, formatRelative } from "@/lib/utils";
import { ROLES, TASK_STATUS, type TaskStatus } from "@/lib/constants";
import {
  addTaskComment,
  deleteTask,
  updateTaskStatus,
} from "@/actions/tasks";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  const ctx = await requireMembership();
  await connectDb();

  const task = await Task.findOne({ _id: id, householdId: ctx.householdId }).lean();
  if (!task) notFound();

  // Staff sees only their own assigned tasks
  if (ctx.role === ROLES.STAFF && String(task.assigneeId) !== ctx.userId) notFound();

  const [comments, assignee, creator] = await Promise.all([
    TaskComment.find({ taskId: task._id }).sort({ createdAt: 1 }).lean(),
    task.assigneeId ? User.findById(task.assigneeId).select("name").lean() : null,
    User.findById(task.createdBy).select("name").lean(),
  ]);

  const authorIds = Array.from(new Set(comments.map((c) => String(c.authorId))));
  const authors = await User.find({ _id: { $in: authorIds } }).select("_id name").lean();
  const authorMap = new Map(authors.map((u) => [String(u._id), u.name]));

  const canEdit = ctx.role === ROLES.HOMEOWNER;
  const canUpdateStatus = canEdit || String(task.assigneeId) === ctx.userId;

  return (
    <div className="container max-w-3xl space-y-5 py-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4" /> All tasks
          </Link>
        </Button>
        {canEdit && (
          <form action={deleteTask}>
            <input type="hidden" name="taskId" value={String(task._id)} />
            <Button type="submit" variant="ghost" size="sm" className="text-destructive">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </form>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardTitle className="text-xl">{task.title}</CardTitle>
            <div className="flex items-center gap-1.5">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {task.description && (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Meta label="Assignee" value={assignee?.name ?? "Unassigned"} />
            <Meta label="Created by" value={creator?.name ?? "Unknown"} />
            <Meta
              label="Due"
              value={task.dueAt ? formatDate(task.dueAt, { hour: "numeric", minute: "2-digit" }) : "—"}
            />
            <Meta label="Recurrence" value={task.recurrence} />
          </dl>

          {canUpdateStatus && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {(Object.values(TASK_STATUS) as TaskStatus[]).map((s) => (
                  <form key={s} action={updateTaskStatus}>
                    <input type="hidden" name="taskId" value={String(task._id)} />
                    <input type="hidden" name="status" value={s} />
                    <Button
                      type="submit"
                      size="sm"
                      variant={task.status === s ? "default" : "outline"}
                      disabled={task.status === s}
                      className="capitalize"
                    >
                      {s.replace("_", " ")}
                    </Button>
                  </form>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={String(c._id)} className="flex gap-3">
                  <Avatar name={authorMap.get(String(c.authorId)) ?? "?"} size={32} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium">
                        {authorMap.get(String(c.authorId)) ?? "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelative(c.createdAt)}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Separator />
          <form action={addTaskComment} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="taskId" value={String(task._id)} />
            <Textarea
              name="body"
              required
              placeholder="Add a comment…"
              rows={2}
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 capitalize">{value}</dd>
    </div>
  );
}
