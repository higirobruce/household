import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Home className="h-3.5 w-3.5" />
            </span>
            <span className="text-sm">{APP_NAME}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/pricing"
              className="hidden rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground sm:inline"
            >
              Pricing
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
