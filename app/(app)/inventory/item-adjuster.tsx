"use client";

import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustInventory, deleteInventoryItem } from "@/actions/inventory";

export function ItemAdjuster({
  itemId,
  name,
  canDelete,
}: {
  itemId: string;
  name: string;
  canDelete: boolean;
}) {
  const [step, setStep] = useState(1);

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        step="1"
        value={step}
        onChange={(e) => setStep(Math.max(1, Number(e.target.value) || 1))}
        className="h-9 w-16 text-center"
        aria-label={`Step for ${name}`}
      />
      <form action={adjustInventory}>
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="delta" value={-step} />
        <Button type="submit" size="icon" variant="outline" aria-label={`Decrease ${name}`}>
          <Minus className="h-4 w-4" />
        </Button>
      </form>
      <form action={adjustInventory}>
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="delta" value={step} />
        <Button type="submit" size="icon" aria-label={`Increase ${name}`}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>
      {canDelete && (
        <form action={deleteInventoryItem}>
          <input type="hidden" name="itemId" value={itemId} />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            aria-label={`Delete ${name}`}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
