import { cn } from "@/lib/utils";

export function Avatar({
  name,
  className,
  size = 32,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden
    >
      {initials || "?"}
    </span>
  );
}
