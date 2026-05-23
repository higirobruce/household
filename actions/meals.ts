"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import mongoose from "mongoose";
import { connectDb } from "@/lib/db/mongoose";
import { ActivityLog, Meal, MealPlan, Notification, HouseholdMembership } from "@/lib/models";
import { requireMembership, requireRole } from "@/lib/auth/guards";
import { MEAL_SLOTS, NOTIFICATION_TYPES, ROLES, type MealSlot } from "@/lib/constants";
import { startOfWeek, isoDay, addDays } from "@/lib/utils";

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const UpsertMealSchema = z.object({
  weekStart: IsoDate,
  date: IsoDate,
  slot: z.enum(MEAL_SLOTS),
  name: z.string().trim().min(1).max(120),
  instructions: z.string().trim().max(2000).optional(),
  ingredients: z.string().trim().max(2000).optional(),
});

async function ensurePlan(householdId: string, weekStart: string, userId: string) {
  const existing = await MealPlan.findOne({ householdId, weekStart });
  if (existing) return existing;
  return MealPlan.create({ householdId, weekStart, createdBy: userId });
}

export async function upsertMeal(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const parsed = UpsertMealSchema.safeParse({
    weekStart: formData.get("weekStart"),
    date: formData.get("date"),
    slot: formData.get("slot"),
    name: formData.get("name"),
    instructions: formData.get("instructions") ?? undefined,
    ingredients: formData.get("ingredients") ?? undefined,
  });
  if (!parsed.success) return;

  await connectDb();
  const plan = await ensurePlan(ctx.householdId, parsed.data.weekStart, ctx.userId);
  const ingredients = parsed.data.ingredients
    ? parsed.data.ingredients
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const updated = await Meal.findOneAndUpdate(
    {
      householdId: ctx.householdId,
      mealPlanId: plan._id,
      date: parsed.data.date,
      slot: parsed.data.slot,
    },
    {
      $set: {
        name: parsed.data.name,
        instructions: parsed.data.instructions,
        ingredients,
      },
      $setOnInsert: { householdId: ctx.householdId, mealPlanId: plan._id },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await ActivityLog.create({
    householdId: ctx.householdId,
    actorId: ctx.userId,
    action: "meal.upserted",
    target: { kind: "meal", id: updated._id },
    meta: { date: parsed.data.date, slot: parsed.data.slot },
  });

  // Notify household staff that the meal plan changed
  const staff = await HouseholdMembership.find({
    householdId: ctx.householdId,
    role: ROLES.STAFF,
    status: "active",
  })
    .select("userId")
    .lean();
  if (staff.length) {
    await Notification.insertMany(
      staff.map((s) => ({
        householdId: ctx.householdId,
        userId: s.userId,
        type: NOTIFICATION_TYPES.MEAL_PLAN_UPDATED,
        title: "Meal plan updated",
        body: `${parsed.data.date} · ${parsed.data.slot}: ${parsed.data.name}`,
        href: "/meals",
      }))
    );
  }

  revalidatePath("/meals");
  revalidatePath("/dashboard");
}

export async function deleteMeal(formData: FormData) {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  const mealId = String(formData.get("mealId") ?? "");
  if (!mongoose.Types.ObjectId.isValid(mealId)) return;
  await connectDb();
  await Meal.deleteOne({ _id: mealId, householdId: ctx.householdId });
  revalidatePath("/meals");
}

export type WeekMealsView = {
  weekStart: string;
  days: {
    date: string;
    slots: Record<
      MealSlot,
      { id: string; name: string; instructions?: string; ingredients: string[] } | null
    >;
  }[];
};

export async function getWeekMeals(weekStartIso?: string): Promise<WeekMealsView> {
  const ctx = await requireMembership();
  const week = weekStartIso ? new Date(weekStartIso) : startOfWeek(new Date());
  const weekStart = isoDay(week);
  await connectDb();

  const meals = await Meal.find({
    householdId: ctx.householdId,
    date: { $gte: weekStart, $lte: isoDay(addDays(week, 6)) },
  }).lean();

  const byKey = new Map(meals.map((m) => [`${m.date}:${m.slot}`, m]));

  const days = Array.from({ length: 7 }).map((_, i) => {
    const date = isoDay(addDays(week, i));
    const slots = Object.fromEntries(
      MEAL_SLOTS.map((slot) => {
        const m = byKey.get(`${date}:${slot}`);
        return [
          slot,
          m
            ? {
                id: String(m._id),
                name: m.name,
                instructions: m.instructions ?? undefined,
                ingredients: Array.isArray(m.ingredients) ? m.ingredients : [],
              }
            : null,
        ];
      })
    ) as WeekMealsView["days"][number]["slots"];
    return { date, slots };
  });

  return { weekStart, days };
}
