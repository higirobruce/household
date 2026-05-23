"use client";

import { useState } from "react";
import { Pencil, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MEAL_SLOTS, type MealSlot } from "@/lib/constants";
import { upsertMeal, type WeekMealsView } from "@/actions/meals";
import { addDays, isoDay } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MealsWeekView({
  view,
  editable,
}: {
  view: WeekMealsView;
  editable: boolean;
}) {
  const weekStartDate = new Date(view.weekStart);
  const prevWeek = isoDay(addDays(weekStartDate, -7));
  const nextWeek = isoDay(addDays(weekStartDate, 7));

  return (
    <div>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Button asChild variant="ghost" size="sm">
          <Link href={`/meals?week=${prevWeek}`}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Link>
        </Button>
        <span className="text-sm font-medium">Week of {view.weekStart}</span>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/meals?week=${nextWeek}`}>
            Next <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="divide-y md:hidden">
        {view.days.map((d, idx) => (
          <div key={d.date} className="p-4">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-sm font-semibold">
                {DAY_NAMES[idx]} · {d.date}
              </p>
            </div>
            <ul className="space-y-2">
              {MEAL_SLOTS.map((slot) => (
                <SlotRow
                  key={slot}
                  date={d.date}
                  slot={slot}
                  meal={d.slots[slot]}
                  editable={editable}
                  weekStart={view.weekStart}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-muted-foreground">
              <th className="w-28 px-4 py-2"></th>
              {view.days.map((d, idx) => (
                <th key={d.date} className="px-3 py-2 font-medium">
                  {DAY_NAMES[idx]}
                  <div className="text-[10px] text-muted-foreground">{d.date.slice(5)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_SLOTS.map((slot) => (
              <tr key={slot} className="border-b align-top">
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {slot}
                </td>
                {view.days.map((d) => (
                  <td key={d.date + slot} className="px-2 py-2">
                    <SlotCell
                      date={d.date}
                      slot={slot}
                      meal={d.slots[slot]}
                      editable={editable}
                      weekStart={view.weekStart}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlotRow({
  date,
  slot,
  meal,
  editable,
  weekStart,
}: {
  date: string;
  slot: MealSlot;
  meal: { id: string; name: string; instructions?: string } | null;
  editable: boolean;
  weekStart: string;
}) {
  return (
    <li className="flex items-start justify-between gap-2 rounded-lg border bg-card/50 p-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {slot}
        </p>
        <p className="text-sm font-medium">{meal?.name ?? "—"}</p>
        {meal?.instructions && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{meal.instructions}</p>
        )}
      </div>
      {editable && (
        <EditMealSheet date={date} slot={slot} meal={meal} weekStart={weekStart} />
      )}
    </li>
  );
}

function SlotCell({
  date,
  slot,
  meal,
  editable,
  weekStart,
}: {
  date: string;
  slot: MealSlot;
  meal: { id: string; name: string; instructions?: string } | null;
  editable: boolean;
  weekStart: string;
}) {
  if (!meal) {
    return editable ? (
      <EditMealSheet
        date={date}
        slot={slot}
        meal={null}
        weekStart={weekStart}
        triggerLabel="Add"
      />
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    );
  }
  return (
    <div className="group rounded-md border bg-card p-2">
      <p className="line-clamp-2 text-sm font-medium">{meal.name}</p>
      {meal.instructions && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{meal.instructions}</p>
      )}
      {editable && (
        <div className="mt-2">
          <EditMealSheet
            date={date}
            slot={slot}
            meal={meal}
            weekStart={weekStart}
            triggerLabel="Edit"
          />
        </div>
      )}
    </div>
  );
}

function EditMealSheet({
  date,
  slot,
  meal,
  weekStart,
  triggerLabel,
}: {
  date: string;
  slot: MealSlot;
  meal: { id: string; name: string; instructions?: string } | null;
  weekStart: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          {triggerLabel === "Add" ? (
            <>
              <Plus className="h-3 w-3" /> Add
            </>
          ) : (
            <>
              <Pencil className="h-3 w-3" />
              {triggerLabel ?? ""}
            </>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle className="capitalize">{slot}</SheetTitle>
          <SheetDescription>{date}</SheetDescription>
        </SheetHeader>
        <form
          action={async (fd) => {
            await upsertMeal(fd);
            setOpen(false);
          }}
          className="mt-4 space-y-4"
        >
          <input type="hidden" name="weekStart" value={weekStart} />
          <input type="hidden" name="date" value={date} />
          <input type="hidden" name="slot" value={slot} />

          <div className="space-y-1.5">
            <Label htmlFor="name">Dish</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={meal?.name ?? ""}
              placeholder="e.g. Beans and rice"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              name="instructions"
              rows={3}
              defaultValue={meal?.instructions ?? ""}
              placeholder="Notes for whoever is cooking."
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ingredients">Ingredients (comma or newline separated)</Label>
            <Textarea
              id="ingredients"
              name="ingredients"
              rows={2}
              placeholder="rice, kidney beans, onion"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
