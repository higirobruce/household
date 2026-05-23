import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const MealPlanSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    /** ISO date of the Monday that anchors this plan (YYYY-MM-DD). */
    weekStart: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    title: { type: String, trim: true, maxlength: 80 },
    notes: { type: String, maxlength: 2000 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

MealPlanSchema.index({ householdId: 1, weekStart: 1 }, { unique: true });

export type MealPlanDoc = InferSchemaType<typeof MealPlanSchema> & {
  _id: Schema.Types.ObjectId;
};
export const MealPlan: Model<MealPlanDoc> =
  (models.MealPlan as Model<MealPlanDoc>) ?? model<MealPlanDoc>("MealPlan", MealPlanSchema);
