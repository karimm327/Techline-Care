import { cn } from "@/lib/ui/cn";

// M14 — dégradé qui balaie (1.5 s, linéaire). Donner la forme réelle via className.
export default function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block animate-shimmer rounded-md bg-gradient-to-r from-surface-2 from-0% via-skeleton-hi via-45% to-surface-2 to-90% bg-[length:1200px_100%]",
        className,
      )}
    />
  );
}
