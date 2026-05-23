import {
  Bell,
  Boxes,
  ClipboardList,
  Home,
  Settings,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { ROLES, type Role } from "@/lib/constants";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: Role[];
  /** Show on mobile bottom nav (max 5 items). */
  mobile?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home, mobile: true },
  { href: "/tasks", label: "Tasks", icon: ClipboardList, mobile: true },
  { href: "/meals", label: "Meals", icon: UtensilsCrossed, mobile: true },
  { href: "/inventory", label: "Inventory", icon: Boxes, mobile: true },
  { href: "/notifications", label: "Alerts", icon: Bell, mobile: true },
  { href: "/staff", label: "Staff", icon: UsersRound, roles: [ROLES.HOMEOWNER] },
  { href: "/settings", label: "Settings", icon: Settings, roles: [ROLES.HOMEOWNER] },
];

export function visibleFor(role: Role) {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
