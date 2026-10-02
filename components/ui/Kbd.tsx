import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export default function Kbd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded-xs border border-line-strong bg-bg px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-fg-2",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
