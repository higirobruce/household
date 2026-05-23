import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const TaskCommentSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

TaskCommentSchema.index({ taskId: 1, createdAt: 1 });

export type TaskCommentDoc = InferSchemaType<typeof TaskCommentSchema> & {
  _id: Schema.Types.ObjectId;
};
export const TaskComment: Model<TaskCommentDoc> =
  (models.TaskComment as Model<TaskCommentDoc>) ??
  model<TaskCommentDoc>("TaskComment", TaskCommentSchema);
