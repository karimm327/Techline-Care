"use client";

import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { Toaster as ToasterSonner, toast } from "sonner";
import { cn } from "@/lib/ui/cn";

type Ton = "succes" | "info" | "alerte" | "erreur";

const TONS: Record<Ton, { pastille: string; barre: string; icone: ReactNode }> =
  {
    succes: {
      pastille: "bg-success/20 text-success-fg",
      barre: "bg-success",
      icone: <Check strokeWidth={2.4} className="size-4" />,
    },
    info: {
      pastille: "bg-accent/25 text-accent-fg-2",
      barre: "bg-accent-soft",
      icone: <Info strokeWidth={2.2} className="size-4" />,
    },
    alerte: {
      pastille: "bg-st-encours/20 text-st-encours-fg",
      barre: "bg-st-encours",
      icone: <TriangleAlert strokeWidth={2.2} className="size-4" />,
    },
    erreur: {
      pastille: "bg-danger/20 text-danger-fg",
      barre: "bg-danger",
      icone: <CircleAlert strokeWidth={2.2} className="size-4" />,
    },
  };

type OptionsToast = {
  titre: string;
  description?: ReactNode;
  ton?: Ton;
  // Durée en ms (6 s par défaut, 10 s avec une action « Annuler »)
  duree?: number;
  action?: { label: string; onClick: () => void };
};

// M11 — toast aux couleurs Ardoise : pastille teintée, action, barre de progression
export function notifier({
  titre,
  description,
  ton = "succes",
  duree,
  action,
}: OptionsToast) {
  const t = TONS[ton];
  const duration = duree ?? (action ? 10_000 : 6000);
  return toast.custom(
    (id) => (
      <div
        className="group relative flex w-[356px] max-w-[calc(100vw-32px)] items-start gap-3 overflow-hidden rounded-[14px] border border-line-strong bg-surface-2 p-3.5 pb-4 text-fg shadow-xl"
        role={ton === "erreur" ? "alert" : "status"}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex size-[30px] shrink-0 items-center justify-center rounded-full",
            t.pastille,
          )}
        >
          {t.icone}
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-[13.5px] font-semibold">{titre}</p>
          {description && (
            <div className="mt-0.5 text-[12.5px] text-fg-2">{description}</div>
          )}
        </div>
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              toast.dismiss(id);
            }}
            className="cible-tactile mt-0.5 h-8 shrink-0 rounded-[8px] px-2.5 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            {action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Fermer la notification"
          onClick={() => toast.dismiss(id)}
          className="-mr-1 -mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[8px] text-fg-3 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-4" />
        </button>
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 bottom-0 h-[3px] origin-left animate-progress group-hover:[animation-play-state:paused]",
            t.barre,
          )}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    ),
    { duration },
  );
}

// À monter une fois dans le layout racine
export default function Toaster() {
  return (
    <ToasterSonner
      position="bottom-right"
      gap={10}
      offset={20}
      toastOptions={{ unstyled: true }}
    />
  );
}
