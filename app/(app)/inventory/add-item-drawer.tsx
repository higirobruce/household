"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { INVENTORY_CATEGORIES } from "@/lib/constants";
import { createInventoryItem } from "@/actions/inventory";

export function AddItemDrawer() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createInventoryItem, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>New inventory item</SheetTitle>
          <SheetDescription>Track quantities and get notified when low.</SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required placeholder="e.g. Rice" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                name="category"
                defaultValue="Pantry"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
              >
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit</Label>
              <Input id="unit" name="unit" defaultValue="unit" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={0}
                step="0.01"
                defaultValue={0}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minQuantity">Min quantity</Label>
              <Input
                id="minQuantity"
                name="minQuantity"
                type="number"
                min={0}
                step="0.01"
                defaultValue={1}
                required
              />
            </div>
          </div>

          {state && !state.ok && (
            <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add item
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
