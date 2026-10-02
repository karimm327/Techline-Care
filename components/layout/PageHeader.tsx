import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  // Boutons à droite (passent sous le titre en dessous de 640 px)
  actions?: ReactNode;
  className?: string;
};

// En-tête de page standard : surtitre, titre, sous-titre, actions. Entrée M01.
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex animate-rise flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-eyebrow uppercase text-accent-fg">{eyebrow}</p>
        )}
        <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-[-.02em] sm:text-h1">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-fg-2">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  );
}
