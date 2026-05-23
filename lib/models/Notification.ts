import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { NOTIFICATION_TYPES } from "@/lib/constants";

const NotificationSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    /** Recipient. */
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
    title: { type: String, required: true, maxlength: 140 },
    body: { type: String, maxlength: 500 },
    /** Optional in-app link. */
    href: { type: String, maxlength: 240 },
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export type NotificationDoc = InferSchemaType<typeof NotificationSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Notification: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ??
  model<NotificationDoc>("Notification", NotificationSchema);
