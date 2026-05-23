import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLES } from "@/lib/constants";

const HouseholdMembershipSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.STAFF,
    },
    status: {
      type: String,
      enum: ["invited", "active", "removed"],
      default: "active",
      index: true,
    },
    /** Snapshot of the inviter for audit. */
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    invitedAt: { type: Date },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A user can only have one membership per household
HouseholdMembershipSchema.index({ householdId: 1, userId: 1 }, { unique: true });

export type HouseholdMembershipDoc = InferSchemaType<typeof HouseholdMembershipSchema> & {
  _id: Schema.Types.ObjectId;
};
export const HouseholdMembership: Model<HouseholdMembershipDoc> =
  (models.HouseholdMembership as Model<HouseholdMembershipDoc>) ??
  model<HouseholdMembershipDoc>("HouseholdMembership", HouseholdMembershipSchema);
