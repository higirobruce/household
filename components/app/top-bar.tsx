import Link from "next/link";
import { Home, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/actions/auth";
import { Notification } from "@/lib/models";
import { connectDb } from "@/lib/db/mongoose";

export async function TopBar({
  user,
  householdName,
}: {
  user: { id: string; name: string; email: string };
  householdName: string;
}) {
  await connectDb();
  const unread = await Notification.countDocuments({ userId: user.id, readAt: null });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:h-16 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Home className="h-3.5 w-3.5" />
        </div>
        <span className="truncate text-sm font-semibold">{householdName}</span>
      </Link>

      <div className="hidden md:block">
        <p className="text-xs text-muted-foreground">Household</p>
        <p className="text-sm font-semibold">{householdName}</p>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link href="/notifications" aria-label="Notifications">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive" />
            )}
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring">
              <Avatar name={user.name} size={32} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action={logout} className="w-full">
                <button className="flex w-full items-center gap-2 text-left">
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
