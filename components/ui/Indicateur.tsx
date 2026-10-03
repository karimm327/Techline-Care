import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/ui/cn";

type Props = {
  label: string;
  icone: LucideIcon;
  // Classe de couleur de l'icône (ex. text-st-nouvelle-fg)
  couleurIcone: string;
  // null : aucune donnée, affiche « — »
  valeur: number | null;
  decimales?: number;
  unite?: string;
  // Précision affichée au survol (et lue par les lecteurs d'écran)
  indication?: string;
  className?: string;
};

// Indicateur compact sur une ligne : icône + valeur + libellé (même style que les compteurs du journal)
export default function Indicateur({
  label,
  icone: Icone,
  couleurIcone,
  valeur,
  decimales = 0,
  unite,
  indication,
  className,
}: Props) {
  const texte =
    valeur === null
      ? "—"
      : valeur.toLocaleString("fr-FR", {
          minimumFractionDigits: decimales,
          maximumFractionDigits: decimales,
        });
  return (
    <span
      title={indication}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-xs text-fg-3",
        className,
      )}
    >
      <Icone
        aria-hidden="true"
        strokeWidth={2}
        className={cn("size-3.5", couleurIcone)}
      />
      <span
        className={cn(
          "font-semibold tabular-nums",
          valeur === null ? "text-fg-4" : "text-fg",
        )}
      >
        {texte}
        {unite && valeur !== null && <span className="ml-0.5">{unite}</span>}
      </span>
      {label}
      {indication && <span className="sr-only"> ({indication})</span>}
    </span>
  );
}
