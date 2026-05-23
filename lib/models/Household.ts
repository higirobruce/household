import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const HouseholdSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    /** Plan tier — future SaaS billing. */
    plan: { type: String, enum: ["free", "pro", "family"], default: "free" },
    /** Soft delete for data retention compliance. */
    archivedAt: { type: Date, default: null },
    settings: {
      timezone: { type: String, default: "UTC" },
      lowStockThreshold: { type: Number, default: 1, min: 0 },
    },
  },
  { timestamps: true }
);

HouseholdSchema.index({ ownerId: 1, archivedAt: 1 });

export type HouseholdDoc = InferSchemaType<typeof HouseholdSchema> & {
  _id: Schema.Types.ObjectId;
};
export const Household: Model<HouseholdDoc> =
  (models.Household as Model<HouseholdDoc>) ?? model<HouseholdDoc>("Household", HouseholdSchema);
