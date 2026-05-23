import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { RECURRENCE, TASK_PRIORITY, TASK_STATUS } from "@/lib/constants";

const TaskSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, maxlength: 4000 },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dueAt: { type: Date, index: true },
    completedAt: { type: Date },
    recurrence: {
      type: String,
      enum: Object.values(RECURRENCE),
      default: RECURRENCE.NONE,
    },
  },
  { timestamps: true }
);

TaskSchema.index({ householdId: 1, status: 1, dueAt: 1 });
TaskSchema.index({ householdId: 1, assigneeId: 1, status: 1 });

export type TaskDoc = InferSchemaType<typeof TaskSchema> & { _id: Schema.Types.ObjectId };
export const Task: Model<TaskDoc> =
  (models.Task as Model<TaskDoc>) ?? model<TaskDoc>("Task", TaskSchema);
