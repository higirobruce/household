"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type ActionResult, login, register } from "@/actions/auth";

type Mode = "login" | "register";

const action = (mode: Mode) => (mode === "login" ? login : register);

export function AuthForm({ mode }: { mode: Mode }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action(mode),
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required placeholder="Jane Smith" />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder={mode === "register" ? "At least 8 characters" : "••••••••"}
        />
      </div>

      {state && !state.ok && (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
