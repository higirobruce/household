"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
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
import { inviteMember } from "@/actions/household";
import { ROLES } from "@/lib/constants";

export function InviteDrawer() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(inviteMember, null);

  useEffect(() => {
    if (state?.ok) setOpen(false);
  }, [state]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4" /> Add member
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Add household member</SheetTitle>
          <SheetDescription>
            Provision an account directly. Share the temporary password with them out-of-band.
          </SheetDescription>
        </SheetHeader>
        <form action={formAction} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Full name</Label>
            <Input id="m-name" name="name" required placeholder="Mary Doe" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-email">Email</Label>
            <Input id="m-email" name="email" type="email" required placeholder="mary@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-password">Temporary password</Label>
            <Input
              id="m-password"
              name="password"
              type="text"
              minLength={8}
              required
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-role">Role</Label>
            <select
              id="m-role"
              name="role"
              defaultValue={ROLES.STAFF}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
            >
              <option value={ROLES.STAFF}>Staff</option>
              <option value={ROLES.HOMEOWNER}>Homeowner</option>
            </select>
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
              {pending && <Loader2 className="h-4 w-4 animate-spin" />} Add member
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
