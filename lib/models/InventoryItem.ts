import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { INVENTORY_CATEGORIES } from "@/lib/constants";

const InventoryAdjustmentSchema = new Schema(
  {
    delta: { type: Number, required: true },
    quantityAfter: { type: Number, required: true },
    note: { type: String, maxlength: 200 },
    byUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const InventoryItemSchema = new Schema(
  {
    householdId: {
      type: Schema.Types.ObjectId,
      ref: "Household",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    category: { type: String, enum: INVENTORY_CATEGORIES, default: "Other" },
    unit: { type: String, default: "unit", maxlength: 16 },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    minQuantity: { type: Number, default: 1, min: 0 },
    /** Bounded history. Older entries are trimmed in the action. */
    history: { type: [InventoryAdjustmentSchema], default: [] },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ householdId: 1, name: 1 }, { unique: true });
InventoryItemSchema.index({ householdId: 1, category: 1 });

export type InventoryItemDoc = InferSchemaType<typeof InventoryItemSchema> & {
  _id: Schema.Types.ObjectId;
};
export const InventoryItem: Model<InventoryItemDoc> =
  (models.InventoryItem as Model<InventoryItemDoc>) ??
  model<InventoryItemDoc>("InventoryItem", InventoryItemSchema);
