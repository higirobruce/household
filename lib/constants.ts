export const APP_NAME = "Household Operations";

export const ROLES = {
  HOMEOWNER: "homeowner",
  STAFF: "staff",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const TASK_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
export type TaskStatus = (typeof TASK_STATUS)[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;
export type TaskPriority = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];

export const RECURRENCE = {
  NONE: "none",
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
export type Recurrence = (typeof RECURRENCE)[keyof typeof RECURRENCE];

export const MEAL_SLOTS = ["breakfast", "lunch", "dinner"] as const;
export type MealSlot = (typeof MEAL_SLOTS)[number];

export const INVENTORY_CATEGORIES = [
  "Pantry",
  "Dairy",
  "Produce",
  "Cleaning",
  "Toiletries",
  "Other",
] as const;
export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number];

export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: "task_assigned",
  TASK_COMPLETED: "task_completed",
  INVENTORY_LOW: "inventory_low",
  MEAL_PLAN_UPDATED: "meal_plan_updated",
  HOUSEHOLD_INVITE: "household_invite",
} as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
