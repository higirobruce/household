"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHousehold } from "@/actions/household";

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createHousehold, null);
  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Household name</Label>
        <Input id="name" name="name" required placeholder="The Smith Home" autoFocus />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="timezone">Timezone</Label>
        <Input id="timezone" name="timezone" placeholder="UTC" defaultValue="UTC" />
      </div>
      {state && !state.ok && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button className="w-full" size="lg" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Create household
      </Button>
    </form>
  );
}
