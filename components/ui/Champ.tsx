import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

// Base commune des champs (M19) : bordure, survol, focus indigo 4 px, fond plus sombre au focus
export const classesChamp = (erreur?: boolean) =>
  cn(
    "w-full rounded-[11px] border bg-bg text-[14.5px] text-fg placeholder:text-fg-4",
    "transition-[border-color,box-shadow,background-color] duration-[180ms] ease-out",
    "hover:border-line-hover focus:border-accent-soft focus:bg-field-focus focus:shadow-focus focus:outline-none",
    "disabled:cursor-not-allowed disabled:opacity-60",
    erreur
      ? "border-danger hover:border-danger focus:border-danger"
      : "border-line-field",
  );

type Props = {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  // Compteur « n/max » affiché à droite du libellé
  counter?: { value: number; max: number };
  className?: string;
  children: ReactNode;
};

// Libellé + champ + aide / erreur. Les identifiants d'aide et d'erreur sont dérivés de `id`.
export default function Champ({
  id,
  label,
  hint,
  error,
  counter,
  className,
  children,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || counter) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label htmlFor={id} className="text-[13px] font-semibold text-fg-1">
              {label}
            </label>
          )}
          {counter && (
            <span
              className={cn(
                "ml-auto font-mono text-[11.5px] tabular-nums",
                counter.value > counter.max ? "text-danger-fg" : "text-fg-4",
              )}
            >
              {counter.value}/{counter.max}
            </span>
          )}
        </div>
      )}
      {children}
      {error ? (
        // key : l'animation shake se rejoue quand le message change
        <p
          key={error}
          id={`${id}-erreur`}
          className="animate-shake text-[12.5px] font-medium text-danger-fg"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-aide`} className="text-[12.5px] text-fg-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function decritPar(id: string, error?: string, hint?: ReactNode) {
  if (error) return `${id}-erreur`;
  if (hint) return `${id}-aide`;
  return undefined;
}
