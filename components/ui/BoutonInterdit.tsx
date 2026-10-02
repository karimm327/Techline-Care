"use client";

import { type ReactNode, useId } from "react";
import { cn } from "@/lib/ui/cn";
import {
  classesBouton,
  type TailleBouton,
  type VarianteBouton,
} from "./Button";

type Props = {
  children: ReactNode;
  icon?: ReactNode;
  variant?: VarianteBouton;
  size?: TailleBouton;
  raison?: string;
  className?: string;
};

// Action indisponible pour le rôle courant : bouton atteignable au clavier (aria-disabled)
// avec une infobulle qui explique pourquoi
export default function BoutonInterdit({
  children,
  icon,
  variant = "secondary",
  size = "md",
  raison = "Votre rôle ne permet pas cette action.",
  className,
}: Props) {
  const id = useId();
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-disabled="true"
        aria-describedby={id}
        onClick={(e) => e.preventDefault()}
        className={classesBouton({
          variant,
          size,
          className: cn(
            "cursor-not-allowed opacity-55 hover:brightness-100 hover:shadow-none active:scale-100",
            className,
          ),
        })}
      >
        {icon}
        {children}
      </button>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-overlay mb-2 hidden w-max max-w-[240px] -translate-x-1/2 rounded-[8px] border border-line-strong bg-surface-2 px-2.5 py-1.5 text-center text-[12.5px] font-medium text-fg shadow-lg group-focus-within:block group-hover:block"
      >
        {raison}
      </span>
    </span>
  );
}
