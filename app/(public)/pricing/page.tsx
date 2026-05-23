import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    description: "For a single household getting started.",
    cta: "Get started",
    href: "/register",
    features: ["1 household", "Up to 2 members", "Tasks, meals, inventory", "Email support"],
  },
  {
    name: "Family",
    price: "$8",
    cadence: "/month",
    description: "For homes with staff and routines that scale.",
    cta: "Start Family",
    href: "/register",
    features: [
      "Up to 8 members",
      "Recurring tasks",
      "Activity history",
      "Inventory low-stock alerts",
    ],
    highlight: true,
  },
  {
    name: "Pro",
    price: "$24",
    cadence: "/month",
    description: "For estates and property managers.",
    cta: "Contact sales",
    href: "/register",
    features: ["Unlimited members", "Multiple households", "Audit logs", "Priority support"],
  },
];

export default function PricingPage() {
  return (
    <section className="container py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
          Simple pricing
        </h1>
        <p className="mt-3 text-muted-foreground">
          Start free. Upgrade when your household grows.
        </p>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3">
        {TIERS.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlight ? "border-primary shadow-md" : undefined}
          >
            <CardHeader>
              <CardTitle className="flex items-baseline gap-2">
                {tier.name}
                {tier.highlight && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Popular
                  </span>
                )}
              </CardTitle>
              <CardDescription>{tier.description}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold">{tier.price}</span>
                <span className="text-sm text-muted-foreground">{tier.cadence}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={tier.highlight ? "default" : "outline"}>
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
