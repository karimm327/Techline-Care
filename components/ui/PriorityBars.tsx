import { cn } from "@/lib/ui/cn";
import { BARRE_VIDE, estCodePriorite, PRIORITES } from "@/lib/ui/status";

const HAUTEURS = ["h-[5px]", "h-[9px]", "h-[13px]"] as const;

type Props = {
  priority: string;
  showLabel?: boolean;
  size?: "sm" | "md";
  className?: string;
};

// 3 barres 3 px (5 / 9 / 13) ; HAUTE ajoute un point pulsant (M08)
export default function PriorityBars({
  priority,
  showLabel = true,
  size = "md",
  className,
}: Props) {
  const p = estCodePriorite(priority) ? PRIORITES[priority] : null;
  const niveau = p?.niveau ?? 0;
  const libelle = p?.label ?? priority;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-fg-1",
        size === "sm" ? "text-xs" : "text-[13px]",
        className,
      )}
    >
      <span aria-hidden="true" className="flex h-[13px] items-end gap-[2px]">
        {HAUTEURS.map((h, i) => (
          <span
            key={h}
            className={cn(
              "w-[3px] rounded-[1px]",
              h,
              i < niveau ? p?.barre : BARRE_VIDE,
            )}
          />
        ))}
      </span>
      {showLabel ? (
        <span>{libelle}</span>
      ) : (
        <span className="sr-only">Priorité {libelle.toLowerCase()}</span>
      )}
      {priority === "HAUTE" && (
        <span
          aria-hidden="true"
          className="size-[7px] animate-pulse rounded-full bg-prio-haute"
        />
      )}
    </span>
  );
}
