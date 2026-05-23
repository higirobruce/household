/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv(); // also load .env if present
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
  User,
  Household,
  HouseholdMembership,
  Task,
  MealPlan,
  Meal,
  InventoryItem,
} from "@/lib/models";
import {
  INVENTORY_CATEGORIES,
  RECURRENCE,
  ROLES,
  TASK_PRIORITY,
  TASK_STATUS,
} from "@/lib/constants";
import { addDays, isoDay, startOfWeek } from "@/lib/utils";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required");
  await mongoose.connect(uri);
  console.log("Connected.");

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Household.deleteMany({}),
    HouseholdMembership.deleteMany({}),
    Task.deleteMany({}),
    MealPlan.deleteMany({}),
    Meal.deleteMany({}),
    InventoryItem.deleteMany({}),
  ]);

  const password = await bcrypt.hash("password123", 10);

  const homeowner = await User.create({
    name: "Alex Owner",
    email: "owner@example.com",
    passwordHash: password,
  });

  const staff = await User.create({
    name: "Mary Helper",
    email: "staff@example.com",
    passwordHash: password,
  });

  const household = await Household.create({
    name: "The Owner Home",
    ownerId: homeowner._id,
    settings: { timezone: "UTC", lowStockThreshold: 2 },
  });

  await User.updateOne({ _id: homeowner._id }, { defaultHouseholdId: household._id });

  await HouseholdMembership.insertMany([
    {
      householdId: household._id,
      userId: homeowner._id,
      role: ROLES.HOMEOWNER,
      status: "active",
      joinedAt: new Date(),
    },
    {
      householdId: household._id,
      userId: staff._id,
      role: ROLES.STAFF,
      status: "active",
      invitedBy: homeowner._id,
      invitedAt: new Date(),
      joinedAt: new Date(),
    },
  ]);

  await Task.insertMany([
    {
      householdId: household._id,
      title: "Mop the living room",
      description: "Use the lemon-scented cleaner under the sink.",
      assigneeId: staff._id,
      createdBy: homeowner._id,
      status: TASK_STATUS.PENDING,
      priority: TASK_PRIORITY.MEDIUM,
      dueAt: addDays(new Date(), 1),
      recurrence: RECURRENCE.WEEKLY,
    },
    {
      householdId: household._id,
      title: "Defrost the chicken for dinner",
      assigneeId: staff._id,
      createdBy: homeowner._id,
      status: TASK_STATUS.IN_PROGRESS,
      priority: TASK_PRIORITY.HIGH,
      dueAt: new Date(),
      recurrence: RECURRENCE.NONE,
    },
    {
      householdId: household._id,
      title: "Check inventory before grocery run",
      createdBy: homeowner._id,
      status: TASK_STATUS.PENDING,
      priority: TASK_PRIORITY.LOW,
      recurrence: RECURRENCE.NONE,
    },
  ]);

  const weekStart = isoDay(startOfWeek(new Date()));
  const plan = await MealPlan.create({
    householdId: household._id,
    weekStart,
    createdBy: homeowner._id,
  });
  const today = isoDay(new Date());
  await Meal.insertMany([
    {
      householdId: household._id,
      mealPlanId: plan._id,
      date: today,
      slot: "breakfast",
      name: "Oatmeal & fruit",
      instructions: "Use rolled oats, top with banana and honey.",
      ingredients: ["oats", "banana", "honey", "milk"],
    },
    {
      householdId: household._id,
      mealPlanId: plan._id,
      date: today,
      slot: "lunch",
      name: "Rice and beans",
      ingredients: ["rice", "kidney beans", "onion"],
    },
    {
      householdId: household._id,
      mealPlanId: plan._id,
      date: today,
      slot: "dinner",
      name: "Roast chicken with vegetables",
      instructions: "Defrost chicken in the morning, season generously.",
      ingredients: ["chicken", "potatoes", "carrots", "rosemary"],
    },
  ]);

  await InventoryItem.insertMany([
    {
      householdId: household._id,
      name: "Rice",
      category: "Pantry",
      unit: "kg",
      quantity: 5,
      minQuantity: 2,
      history: [],
    },
    {
      householdId: household._id,
      name: "Milk",
      category: "Dairy",
      unit: "L",
      quantity: 1,
      minQuantity: 2,
      history: [],
    },
    {
      householdId: household._id,
      name: "Dish soap",
      category: "Cleaning",
      unit: "bottle",
      quantity: 1,
      minQuantity: 1,
      history: [],
    },
    {
      householdId: household._id,
      name: "Toilet paper",
      category: "Toiletries",
      unit: "roll",
      quantity: 8,
      minQuantity: 4,
      history: [],
    },
  ]);

  console.log("Seeded:");
  console.log("  Homeowner: owner@example.com / password123");
  console.log("  Staff:     staff@example.com / password123");
  console.log("  Household:", household.name);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
