"use client";

import { motion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { SPRING } from "@/lib/motion";
import { indexDepuisTouche } from "@/lib/ui/clavier";
import { cn } from "@/lib/ui/cn";

export type OptionSegment<T extends string> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
};

type Props<T extends string> = {
  options: OptionSegment<T>[];
  value: T;
  onChange: (valeur: T) => void;
  // Nom accessible du groupe
  label: string;
  // Identifiant unique de la pastille animée (M04), ex. « seg-view »
  layoutId: string;
  size?: "sm" | "md";
  className?: string;
};

// M04 — pastille qui glisse vers l'option choisie. Radiogroup : flèches, Début, Fin.
export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  layoutId,
  size = "md",
  className,
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const courant = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex rounded-[11px] border border-line bg-bg-sunken p-1",
        className,
      )}
    >
      {options.map((o, i) => {
        const actif = o.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: radiogroup visuel à pastille animée, comportement clavier ARIA complet
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={actif}
            tabIndex={actif ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const cible = indexDepuisTouche(e, courant, options.length);
              if (cible === null) return;
              e.preventDefault();
              onChange(options[cible].value);
              refs.current[cible]?.focus();
            }}
            className={cn(
              "relative inline-flex items-center justify-center gap-2 rounded-lg px-3 font-medium transition-colors duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-soft",
              size === "sm" ? "h-8 text-[12.5px]" : "h-9 text-[13px]",
              actif ? "text-fg" : "text-fg-3 hover:text-fg-1",
            )}
          >
            {actif && (
              <motion.span
                layoutId={layoutId}
                transition={SPRING}
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-surface-3 shadow-sm"
              />
            )}
            <span className="relative inline-flex items-center gap-2">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
