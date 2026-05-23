import { requireRole } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { Household } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROLES } from "@/lib/constants";
import { updateHouseholdSettings } from "@/actions/household";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await requireRole(ROLES.HOMEOWNER);
  await connectDb();
  const household = await Household.findById(ctx.householdId).lean();
  if (!household) return null;

  return (
    <div className="container max-w-2xl space-y-5 py-6">
      <PageHeader title="Settings" description="Manage your household profile." />
      <Card>
        <CardHeader>
          <CardTitle>Household</CardTitle>
          <CardDescription>Name, timezone, and inventory defaults.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateHouseholdSettings} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={household.name} required />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  name="timezone"
                  defaultValue={household.settings?.timezone ?? "UTC"}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lowStockThreshold">Default low-stock threshold</Label>
                <Input
                  id="lowStockThreshold"
                  name="lowStockThreshold"
                  type="number"
                  min={0}
                  defaultValue={household.settings?.lowStockThreshold ?? 1}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>You are on the {household.plan} plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Billing integration is not yet enabled in this MVP.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
