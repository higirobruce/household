import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ActivityLogSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    /** e.g. "task.created", "task.status_changed", "inventory.adjusted" */
    action: { type: String, required: true, maxlength: 80 },
    /** Polymorphic target: { kind: "task" | "meal" | "inventory" | "household", id: ObjectId } */
    target: {
      kind: { type: String, required: true, maxlength: 40 },
      id: { type: Schema.Types.ObjectId, required: true },
    },
    /** Arbitrary structured context (small payloads only). */
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ householdId: 1, createdAt: -1 });
ActivityLogSchema.index({ householdId: 1, "target.kind": 1, "target.id": 1 });

export type ActivityLogDoc = InferSchemaType<typeof ActivityLogSchema> & {
  _id: Schema.Types.ObjectId;
};
export const ActivityLog: Model<ActivityLogDoc> =
  (models.ActivityLog as Model<ActivityLogDoc>) ??
  model<ActivityLogDoc>("ActivityLog", ActivityLogSchema);
