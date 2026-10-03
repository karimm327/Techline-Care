"use client";

import { Clock } from "lucide-react";
import { useNow } from "@/lib/hooks/useNow";
import { calculerSla, type EtatSla } from "@/lib/sla";
import { cn } from "@/lib/ui/cn";

export const TONS_SLA: Record<EtatSla, string> = {
  late: "text-prio-haute-fg bg-prio-haute/15",
  warn: "text-st-encours-fg bg-st-encours/10",
  ok: "text-fg-2 bg-fg-2/10",
  done: "text-success-fg bg-success/10",
};

const TITRES: Record<EtatSla, string> = {
  late: "Échéance dépassée",
  warn: "Échéance proche",
  ok: "Temps restant avant l’échéance",
  done: "Clôturée dans les délais",
};

type Props = {
  statut: string;
  createdAt: string | Date;
  dueAt: string | Date | null;
  closedAt?: string | Date | null;
  // Heure du serveur au rendu (même premier rendu côté client)
  maintenant: number;
  // Variante compacte (cartes Kanban) : texte seul, sans pastille
  compact?: boolean;
  className?: string;
};

// Pastille SLA (liste, Kanban) — mise à jour chaque minute sans ré-animer
export default function SlaPill({
  statut,
  createdAt,
  dueAt,
  closedAt,
  maintenant,
  compact = false,
  className,
}: Props) {
  const now = useNow(maintenant);
  const sla = calculerSla({
    statut,
    createdAt,
    dueAt,
    closedAt,
    maintenant: now,
  });
  if (!sla) return <span className="text-fg-4">—</span>;

  if (compact) {
    return (
      <span
        title={TITRES[sla.etat]}
        className={cn(
          "text-[11px] font-semibold",
          TONS_SLA[sla.etat].split(" ")[0],
          className,
        )}
      >
        {sla.libelle}
      </span>
    );
  }
  return (
    <span
      title={TITRES[sla.etat]}
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        TONS_SLA[sla.etat],
        className,
      )}
    >
      <Clock aria-hidden="true" strokeWidth={2.4} className="size-3" />
      <span className="sr-only">{TITRES[sla.etat]} : </span>
      {sla.libelle}
    </span>
  );
}
