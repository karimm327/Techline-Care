"use client";

import { useNow } from "@/lib/hooks/useNow";
import { calculerSla } from "@/lib/sla";
import { cn } from "@/lib/ui/cn";
import { heure } from "@/lib/ui/format";

const CIRCONFERENCE = 2 * Math.PI * 42; // ≈ 264

type Props = {
  statut: string;
  createdAt: string | Date;
  dueAt: string | Date | null;
  closedAt?: string | Date | null;
  maintenant: number;
  className?: string;
};

// Libellé de l'échéance : « aujourd'hui, 16:30 », « demain, 09:00 », « 12 oct., 14:00 »
function libelleEcheance(d: Date, maintenant: number) {
  const jour = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const ecart = Math.round((jour(d) - jour(new Date(maintenant))) / 86_400_000);
  const quand =
    ecart === 0
      ? "aujourd’hui"
      : ecart === 1
        ? "demain"
        : ecart === -1
          ? "hier"
          : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${quand}, ${heure(d)}`;
}

// Anneau SLA (fiche demande) — M17 : entrée 1,6 s, couleur selon le délai restant
export default function SlaRing({
  statut,
  createdAt,
  dueAt,
  closedAt,
  maintenant,
  className,
}: Props) {
  const now = useNow(maintenant);
  const sla = calculerSla({
    statut,
    createdAt,
    dueAt,
    closedAt,
    maintenant: now,
  });
  if (!sla || !dueAt) return null;

  const couleur =
    sla.etat === "done"
      ? "stroke-success"
      : sla.ratioRestant > 0.5
        ? "stroke-success"
        : sla.ratioRestant > 0.15
          ? "stroke-st-encours"
          : "stroke-prio-haute";
  const texte =
    sla.etat === "done"
      ? "text-success-fg"
      : sla.etat === "late"
        ? "text-prio-haute-fg"
        : sla.etat === "warn"
          ? "text-st-encours-fg"
          : "text-fg";
  // Part écoulée affichée en plein (anneau vide = tout le délai devant soi)
  const ecoule = sla.etat === "done" ? 1 : 1 - sla.ratioRestant;
  const offset = CIRCONFERENCE * (1 - ecoule);
  const ouverte = sla.etat !== "done" && statut !== "CLOTUREE";

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 rounded-[14px] border border-line bg-surface-inset px-4 py-3",
        className,
      )}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 100 100"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="9"
          className="stroke-line"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCONFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          className={cn(
            "animate-ring transition-[stroke-dashoffset] duration-700",
            couleur,
          )}
          style={{ "--c": CIRCONFERENCE } as React.CSSProperties}
        />
      </svg>
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[.06em] text-fg-3">
          SLA résolution
        </p>
        <p
          className={cn(
            "mt-0.5 font-display text-[22px] font-semibold leading-tight",
            texte,
          )}
        >
          {sla.libelle}
          {sla.etat === "ok" || sla.etat === "warn" ? (
            <span className="ml-1 text-[13px] font-medium text-fg-3">
              restantes
            </span>
          ) : null}
        </p>
        <p className="text-xs text-fg-4">
          {ouverte ? "Échéance" : "Échéance prévue"}{" "}
          {libelleEcheance(new Date(dueAt), now)}
        </p>
      </div>
    </div>
  );
}
