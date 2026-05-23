import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { connectDb } from "@/lib/db/mongoose";
import { HouseholdMembership } from "@/lib/models";
import { readSession } from "@/lib/auth/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Set up your household" };

export default async function OnboardingPage() {
  const session = await readSession();
  if (!session) redirect("/login");
  await connectDb();
  const existing = await HouseholdMembership.findOne({
    userId: session.userId,
    status: "active",
  }).lean();
  if (existing) redirect("/dashboard");

  return (
    <div className="container flex items-center justify-center py-10 sm:py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-serif text-3xl font-normal">Set up your household</CardTitle>
          <CardDescription>
            Give your household a name. You can invite staff and family members next.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
}
