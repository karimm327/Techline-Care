import { cn } from "@/lib/ui/cn";
import { estCodeStatut, libelleStatut, STATUTS } from "@/lib/ui/status";

// Badge de statut : texte -fg, fond 15 %, anneau 35 %. M12 : couleurs en 350 ms.
export default function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const style = estCodeStatut(status)
    ? STATUTS[status].badge
    : "text-fg-2 bg-fg-2/10 ring-fg-2/30";
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-[7px] whitespace-nowrap rounded-[7px] px-2.5 text-[12.5px] font-semibold ring-1 ring-inset transition-colors duration-[350ms]",
        style,
        className,
      )}
    >
      <span aria-hidden="true" className="size-[7px] rounded-full bg-current" />
      {libelleStatut(status)}
    </span>
  );
}
