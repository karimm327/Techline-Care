"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/ui/cn";

type Etat = "verification" | "ok" | "degrade" | "ko";

const ETATS: Record<Etat, { label: string; pastille: string; point: string }> =
  {
    verification: {
      label: "Vérification des services…",
      pastille: "bg-fg-2/10 text-fg-3",
      point: "bg-fg-4",
    },
    ok: {
      label: "Tous les services opérationnels",
      pastille: "bg-success/10 text-success-fg",
      point: "bg-success",
    },
    degrade: {
      label: "Ralentissements",
      pastille: "bg-st-encours/10 text-st-encours-fg",
      point: "bg-st-encours",
    },
    ko: {
      label: "Incident en cours",
      pastille: "bg-prio-haute/15 text-prio-haute-fg",
      point: "bg-prio-haute",
    },
  };

const INTERVALLE_MS = 60_000;

// Pastille d'état des services (F16) : GET /api/health toutes les 60 s
export default function StatusPill() {
  const [etat, setEtat] = useState<Etat>("verification");

  useEffect(() => {
    let actif = true;
    const verifier = async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = (await res.json()) as { status?: string };
        if (!actif) return;
        setEtat(
          data.status === "ok" || data.status === "degrade"
            ? data.status
            : "ko",
        );
      } catch {
        if (actif) setEtat("ko");
      }
    };
    verifier();
    const minuteur = window.setInterval(verifier, INTERVALLE_MS);
    return () => {
      actif = false;
      window.clearInterval(minuteur);
    };
  }, []);

  const e = ETATS[etat];
  return (
    // <output> = région de statut annoncée poliment aux lecteurs d'écran
    <output
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-2.5 py-1",
        e.pastille,
      )}
    >
      <span aria-hidden="true" className="relative size-2">
        {etat === "ok" && (
          <span
            className={cn(
              "absolute inset-0 animate-ping rounded-full",
              e.point,
            )}
          />
        )}
        <span className={cn("absolute inset-0 rounded-full", e.point)} />
      </span>
      {e.label}
    </output>
  );
}
