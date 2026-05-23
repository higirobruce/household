"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import {
  ActivityLog,
  HouseholdMembership,
  Notification,
  Task,
  TaskComment,
} from "@/lib/models";
import { requireMembership, requireRole } from "@/lib/auth/guards";
import {
  NOTIFICATION_TYPES,
  RECURRENCE,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
  type TaskStatus,
} from "@/lib/constants";

const ObjectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), { message: "Invalid id" });

const CreateTaskSchema = z.object({
  title: z.string().trim().min(1).max(140),
  description: z.string().trim().max(4000).optional(),
  assigneeId: z.string().optional().transform((v) => (v ? v : undefined)),
  priority: z.enum([TASK_PRIORITY.LOW, TASK_PRIORITY.MEDIUM, TASK_PRIORITY.HIGH]),
  dueAt: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  recurrence: z.enum([
    RECURRENCE.NONE,
    RECURRENCE.DAILY,
    RECURRENCE.WEEKLY,
    RECURRENCE.MONTHLY,
  ]),
});

export async function createTask(_prev: { ok: boolean; error?: string } | null, formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const parsed = CreateTaskSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    assigneeId: formData.get("assigneeId") ?? undefined,
    priority: formData.get("priority") || TASK_PRIORITY.MEDIUM,
    dueAt: formData.get("dueAt") ?? undefined,
    recurrence: formData.get("recurrence") || RECURRENCE.NONE,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await connectDb();

  // Verify assignee is a member of this household (cross-tenant guard)
  if (parsed.data.assigneeId) {
    const member = await HouseholdMembership.findOne({
      householdId: ctx.householdId,
      userId: parsed.data.assigneeId,
      status: "active",
    }).lean();
    if (!member) return { ok: false as const, error: "Assignee is not a member" };
  }

  const task = await Task.create({
    householdId: ctx.householdId,
    title: parsed.data.title,
    description: parsed.data.description,
    assigneeId: parsed.data.assigneeId,
    createdBy: ctx.userId,
    priority: parsed.data.priority,
    dueAt: parsed.data.dueAt,
    recurrence: parsed.data.recurrence,
    status: TASK_STATUS.PENDING,
  });

  if (parsed.data.assigneeId && parsed.data.assigneeId !== ctx.userId) {
    await Notification.create({
      householdId: ctx.householdId,
      userId: parsed.data.assigneeId,
      type: NOTIFICATION_TYPES.TASK_ASSIGNED,
      title: `New task: ${task.title}`,
      body: task.description?.slice(0, 200),
      href: `/tasks/${task._id}`,
    });
  }

  await ActivityLog.create({
    householdId: ctx.householdId,
    actorId: ctx.userId,
    action: "task.created",
    target: { kind: "task", id: task._id },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect(`/tasks/${task._id}`);
}

const UpdateStatusSchema = z.object({
  taskId: ObjectId,
  status: z.enum([TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS, TASK_STATUS.COMPLETED]),
});

export async function updateTaskStatus(formData: FormData) {
  const ctx = await requireMembership();
  const parsed = UpdateStatusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await connectDb();
  const task = await Task.findOne({ _id: parsed.data.taskId, householdId: ctx.householdId });
  if (!task) return;

  // Staff can only update tasks assigned to them
  if (ctx.role === ROLES.STAFF && String(task.assigneeId) !== ctx.userId) return;

  const previous = task.status as TaskStatus;
  task.status = parsed.data.status;
  if (parsed.data.status === TASK_STATUS.COMPLETED) {
    task.completedAt = new Date();
  } else {
    task.completedAt = undefined as unknown as Date;
  }
  await task.save();

  await ActivityLog.create({
    householdId: ctx.householdId,
    actorId: ctx.userId,
    action: "task.status_changed",
    target: { kind: "task", id: task._id },
    meta: { from: previous, to: parsed.data.status },
  });

  if (parsed.data.status === TASK_STATUS.COMPLETED && String(task.createdBy) !== ctx.userId) {
    await Notification.create({
      householdId: ctx.householdId,
      userId: task.createdBy,
      type: NOTIFICATION_TYPES.TASK_COMPLETED,
      title: `Task completed: ${task.title}`,
      href: `/tasks/${task._id}`,
    });
  }

  revalidatePath("/tasks");
  revalidatePath(`/tasks/${task._id}`);
  revalidatePath("/dashboard");
}

const CommentSchema = z.object({
  taskId: ObjectId,
  body: z.string().trim().min(1).max(2000),
});

export async function addTaskComment(formData: FormData) {
  const ctx = await requireMembership();
  const parsed = CommentSchema.safeParse({
    taskId: formData.get("taskId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return;

  await connectDb();
  const task = await Task.findOne({
    _id: parsed.data.taskId,
    householdId: ctx.householdId,
  }).lean();
  if (!task) return;

  await TaskComment.create({
    householdId: ctx.householdId,
    taskId: task._id,
    authorId: ctx.userId,
    body: parsed.data.body,
  });

  revalidatePath(`/tasks/${task._id}`);
}

export async function deleteTask(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const taskId = String(formData.get("taskId") ?? "");
  if (!mongoose.Types.ObjectId.isValid(taskId)) return;
  await connectDb();
  await Task.deleteOne({ _id: taskId, householdId: ctx.householdId });
  await TaskComment.deleteMany({ taskId, householdId: ctx.householdId });
  revalidatePath("/tasks");
  redirect("/tasks");
}
