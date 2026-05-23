import { requireMembership } from "@/lib/auth/guards";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { getWeekMeals } from "@/actions/meals";
import { MealsWeekView } from "./meals-week-view";
import { ROLES } from "@/lib/constants";
import { startOfWeek, isoDay } from "@/lib/utils";

export const metadata = { title: "Meals" };
export const dynamic = "force-dynamic";

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const ctx = await requireMembership();
  const sp = await searchParams;
  const week = sp.week ?? isoDay(startOfWeek(new Date()));
  const view = await getWeekMeals(week);

  return (
    <div className="container max-w-5xl space-y-5 py-6">
      <PageHeader
        title="Meal plan"
        description={
          ctx.role === ROLES.HOMEOWNER
            ? "Plan breakfast, lunch, and dinner for the week."
            : "What to cook each day."
        }
      />
      <Card>
        <MealsWeekView view={view} editable={ctx.role === ROLES.HOMEOWNER} />
      </Card>
    </div>
  );
}
