import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Smartphone,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <section className="container py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Built for families and household teams
          </div>
          <h1 className="text-balance font-serif text-5xl font-normal leading-[1.05] tracking-tight sm:text-6xl">
            Run your household like a well-oiled team.
          </h1>
          <p className="mt-4 text-balance text-lg text-muted-foreground">
            One calm place to assign tasks, plan meals, and track inventory — with everyone
            on the same page, on any device.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                Start free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="container pb-16 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Tasks that stick",
              body: "Assign, prioritize, and track work without nagging. Recurring tasks keep routines on rails.",
            },
            {
              icon: UtensilsCrossed,
              title: "Weekly meal planning",
              body: "Plan breakfast, lunch, and dinner once. Staff sees what to cook each day.",
            },
            {
              icon: Boxes,
              title: "Inventory you can trust",
              body: "Low-stock alerts catch problems before someone is left without rice or soap.",
            },
            {
              icon: Smartphone,
              title: "Mobile-first",
              body: "Designed for the phone in your pocket. Touch-friendly, fast, and offline-aware.",
            },
            {
              icon: ShieldCheck,
              title: "Role-based access",
              body: "Homeowners see everything. Staff see only what they need to do their job.",
            },
            {
              icon: CheckCircle2,
              title: "Calm by design",
              body: "No clutter, no overwhelming dashboards. Just the information you actually use.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
