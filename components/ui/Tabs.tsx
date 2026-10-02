"use client";

import { motion } from "motion/react";
import { type ReactNode, useRef } from "react";
import { SPRING } from "@/lib/motion";
import { indexDepuisTouche } from "@/lib/ui/clavier";
import { cn } from "@/lib/ui/cn";

export type Onglet<T extends string> = {
  value: T;
  label: ReactNode;
  count?: number;
};

type Props<T extends string> = {
  // Préfixe des identifiants : onglet `${id}-onglet-${value}`, panneau `${id}-panneau-${value}`
  id: string;
  items: Onglet<T>[];
  value: T;
  onChange: (valeur: T) => void;
  label: string;
  className?: string;
};

// M04 — soulignement 2 px qui glisse. Tablist ARIA : flèches, Début, Fin (activation automatique).
export default function Tabs<T extends string>({
  id,
  items,
  value,
  onChange,
  label,
  className,
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const courant = Math.max(
    0,
    items.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]",
        className,
      )}
    >
      {items.map((o, i) => {
        const actif = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            id={`${id}-onglet-${o.value}`}
            type="button"
            role="tab"
            aria-selected={actif}
            aria-controls={`${id}-panneau-${o.value}`}
            tabIndex={actif ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              const cible = indexDepuisTouche(e, courant, items.length);
              if (cible === null) return;
              e.preventDefault();
              onChange(items[cible].value);
              refs.current[cible]?.focus();
            }}
            className={cn(
              "relative inline-flex h-11 shrink-0 items-center gap-2 rounded-t-sm px-3 text-[13.5px] font-medium transition-colors duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-soft",
              actif ? "text-fg" : "text-fg-3 hover:text-fg-1",
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 text-[11.5px] font-semibold tabular-nums",
                  actif
                    ? "bg-accent/20 text-accent-fg-2"
                    : "bg-surface-2 text-fg-2",
                )}
              >
                {o.count}
              </span>
            )}
            {actif && (
              <motion.span
                layoutId={`${id}-encre`}
                transition={SPRING}
                aria-hidden="true"
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Panneau associé à un onglet
export function TabPanel({
  id,
  value,
  active,
  children,
  className,
}: {
  id: string;
  value: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      id={`${id}-panneau-${value}`}
      aria-labelledby={`${id}-onglet-${value}`}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: un panneau d'onglet doit être atteignable au clavier
      tabIndex={0}
      className={cn(
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-soft",
        className,
      )}
    >
      {children}
    </div>
  );
}
