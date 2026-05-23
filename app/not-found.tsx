import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-semibold">404</p>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t find that page.</p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Back home</Link>
      </Button>
    </div>
  );
}
