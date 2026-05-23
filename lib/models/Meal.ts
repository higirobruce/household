import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { MEAL_SLOTS } from "@/lib/constants";

const MealSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    mealPlanId: { type: Schema.Types.ObjectId, ref: "MealPlan", required: true, index: true },
    /** ISO date YYYY-MM-DD */
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    slot: { type: String, enum: MEAL_SLOTS, required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    instructions: { type: String, maxlength: 2000 },
    ingredients: [{ type: String, trim: true, maxlength: 120 }],
    /** Optional reference to inventory items used. */
    inventoryRefs: [{ type: Schema.Types.ObjectId, ref: "InventoryItem" }],
  },
  { timestamps: true }
);

MealSchema.index({ mealPlanId: 1, date: 1, slot: 1 }, { unique: true });
MealSchema.index({ householdId: 1, date: 1 });

export type MealDoc = InferSchemaType<typeof MealSchema> & { _id: Schema.Types.ObjectId };
export const Meal: Model<MealDoc> =
  (models.Meal as Model<MealDoc>) ?? model<MealDoc>("Meal", MealSchema);
