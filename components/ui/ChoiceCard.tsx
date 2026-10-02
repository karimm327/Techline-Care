import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Props = {
  // Pastille 30 px (lettre ou icône) ; sa couleur colore aussi la bordure une fois choisie
  icon: ReactNode;
  pastilleClass: string;
  bordureClass: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  className?: string;
};

// Carte de choix (catégorie du formulaire) : bouton-radio visuel, sélection en relief
export default function ChoiceCard({
  icon,
  pastilleClass,
  bordureClass,
  label,
  selected,
  onSelect,
  className,
}: Props) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: carte de choix visuelle, groupe radiogroup géré par le parent
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex h-14 items-center gap-2.5 rounded-xl border px-3.5 text-left text-fg transition-[transform,box-shadow,border-color,background-color] duration-[250ms] ease-out",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
        selected
          ? cn(
              "-translate-y-0.5 bg-accent/10 ring-[3px] ring-accent/20",
              bordureClass,
            )
          : "border-line-strong/70 bg-bg hover:border-line-hover",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-[30px] shrink-0 items-center justify-center rounded-[9px] text-[13px] font-bold text-ink",
          pastilleClass,
        )}
      >
        {icon}
      </span>
      <span className="text-[13.5px] font-semibold">{label}</span>
    </button>
  );
}
