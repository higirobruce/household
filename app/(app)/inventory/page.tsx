import { Boxes, Plus } from "lucide-react";
import { requireMembership } from "@/lib/auth/guards";
import { connectDb } from "@/lib/db/mongoose";
import { InventoryItem } from "@/lib/models";
import { PageHeader } from "@/components/app/page-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/lib/constants";
import { AddItemDrawer } from "./add-item-drawer";
import { ItemAdjuster } from "./item-adjuster";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const ctx = await requireMembership();
  await connectDb();
  const items = await InventoryItem.find({ householdId: ctx.householdId })
    .sort({ category: 1, name: 1 })
    .lean();

  const grouped = new Map<string, typeof items>();
  for (const i of items) {
    const list = grouped.get(i.category) ?? [];
    list.push(i);
    grouped.set(i.category, list);
  }

  return (
    <div className="container max-w-4xl space-y-5 py-6">
      <PageHeader
        title="Inventory"
        description="Track quantities and get alerts when stock runs low."
        action={ctx.role === ROLES.HOMEOWNER ? <AddItemDrawer /> : null}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No inventory yet"
          description={
            ctx.role === ROLES.HOMEOWNER
              ? "Add the items you regularly use to start tracking."
              : "Ask a homeowner to add items to your inventory."
          }
          action={ctx.role === ROLES.HOMEOWNER ? <AddItemDrawer /> : null}
        />
      ) : (
        <div className="space-y-5">
          {[...grouped.entries()].map(([category, list]) => (
            <section key={category} className="space-y-2">
              <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {category}
              </h2>
              <Card>
                <ul className="divide-y">
                  {list.map((i) => {
                    const low = i.quantity <= i.minQuantity;
                    return (
                      <li
                        key={String(i._id)}
                        className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{i.name}</span>
                            {low && <Badge variant="warning">Low</Badge>}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {i.quantity} {i.unit} · min {i.minQuantity}
                          </p>
                        </div>
                        <ItemAdjuster
                          itemId={String(i._id)}
                          name={i.name}
                          canDelete={ctx.role === ROLES.HOMEOWNER}
                        />
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
