"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { visibleFor } from "./nav-config";
import type { Role } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = visibleFor(role).filter((i) => i.mobile).slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur safe-bottom md:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
