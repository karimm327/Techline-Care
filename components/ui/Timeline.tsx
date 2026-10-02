import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type Changement = {
  champ: string;
  avant?: ReactNode;
  apres?: ReactNode;
};

export type ElementFrise = {
  id: string;
  // Classe de fond de la pastille (ex. STATUTS.CLOTUREE.point), accent par défaut
  pastille?: string;
  titre: ReactNode;
  meta?: ReactNode;
  changements?: Changement[];
  contenu?: ReactNode;
};

// Frise verticale : ligne 2 px, pastilles 12 px, diff « ancien → nouveau », cascade 55 ms
export default function Timeline({
  items,
  className,
}: {
  items: ElementFrise[];
  className?: string;
}) {
  return (
    <ol className={cn("relative ml-1.5 border-l-2 border-line", className)}>
      {items.map((it, i) => (
        <li
          key={it.id}
          className="relative animate-rise pb-5 pl-5 last:pb-0"
          style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute -left-[7px] top-1 size-3 rounded-full ring-4 ring-surface",
              it.pastille ?? "bg-accent",
            )}
          />
          <div className="text-[13.5px] text-fg">{it.titre}</div>
          {it.meta && <div className="mt-0.5 text-xs text-fg-4">{it.meta}</div>}
          {it.changements && it.changements.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-[13px] text-fg-2">
              {it.changements.map((c) => (
                <li key={c.champ}>
                  <span className="text-fg-3">{c.champ} : </span>
                  {c.avant !== undefined && (
                    <>
                      <del className="text-fg-4 decoration-danger/70">
                        {c.avant}
                      </del>
                      <span aria-hidden="true" className="mx-1.5 text-fg-4">
                        →
                      </span>
                      <span className="sr-only"> devient </span>
                    </>
                  )}
                  <strong className="font-semibold text-fg">{c.apres}</strong>
                </li>
              ))}
            </ul>
          )}
          {it.contenu && <div className="mt-2">{it.contenu}</div>}
        </li>
      ))}
    </ol>
  );
}
