import { History, Plus, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import DecorFeuillage from "@/components/brand/DecorFeuillage";
import { classesBouton } from "@/components/ui/Button";
import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/ui/cn";
import { pluriel } from "@/lib/ui/format";

type MaFile = {
  total: number;
  en_retard: number;
  bientot: number;
  a_prendre: number;
  en_cours: number;
};

type Indicateur = {
  label: string;
  valeur: number | null;
  unite?: string;
  decimales?: number;
  pastille?: string;
  ton?: "accent" | "late" | "done" | "warn";
  detail: string;
};

type Props = {
  prenom: string;
  date: string;
  // Phrase sous le titre (ex. « 2 éléments à traiter »)
  aTraiter: string;
  file: MaFile;
  indicateurs: Indicateur[];
  peutCreer: boolean;
  admin: boolean;
  // Bascule Liste / Kanban et export, à droite des boutons
  actions?: ReactNode;
};

const TONS = {
  accent: "bg-accent/20 text-accent-fg-2",
  late: "bg-prio-haute/15 text-prio-haute-fg",
  done: "bg-success/15 text-success-fg",
  warn: "bg-st-encours/15 text-st-encours-fg",
} as const;

// Bannière d'accueil du tableau de bord : salutation, actions, « Ma file du jour » et
// indicateurs en petit. Fond décoratif (halos + feuillage SVG) aux couleurs des tokens.
export default function BanniereAccueil({
  prenom,
  date,
  aTraiter,
  file,
  indicateurs,
  peutCreer,
  admin,
  actions,
}: Props) {
  const dansLesDelais = Math.max(0, file.total - file.en_retard - file.bientot);
  const part = (n: number) => (file.total ? (n / file.total) * 100 : 0);

  return (
    <section
      aria-label="Accueil"
      className="relative animate-rise overflow-hidden rounded-xl border border-line bg-surface"
    >
      {/* Décor : halos flous et feuillage dessiné avec un rouge-gorge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-28 size-[380px] rounded-full bg-accent/25 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/3 size-[340px] rounded-full bg-success/15 blur-3xl"
      />
      <DecorFeuillage className="absolute bottom-0 right-0 hidden h-[88%] w-[72%] md:block" />

      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
        {/* Salutation + actions */}
        <div className="flex min-w-0 flex-col justify-between gap-6">
          <div>
            <p className="text-eyebrow uppercase text-accent-fg">{date}</p>
            <h1 className="mt-1.5 font-display text-[30px] font-semibold leading-tight tracking-[-.02em] sm:text-[34px]">
              Bonjour{prenom ? `, ${prenom}` : ""}
            </h1>
            <p className="mt-1.5 text-fg-2">{aTraiter}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {peutCreer && (
              <Link href="/demands/new" className={classesBouton()}>
                <Plus aria-hidden="true" strokeWidth={2.2} className="size-4" />
                Nouvelle demande
              </Link>
            )}
            {admin && (
              <Link
                href="/journal"
                className={classesBouton({ variant: "secondary" })}
              >
                <History
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-4"
                />
                Historique
              </Link>
            )}
            <Link
              href="#charge-equipe"
              className={classesBouton({ variant: "secondary" })}
            >
              <Users aria-hidden="true" strokeWidth={2} className="size-4" />
              Point d’équipe
            </Link>
            {actions && (
              <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
                {actions}
              </div>
            )}
          </div>
        </div>

        {/* Ma file du jour */}
        <div className="self-start rounded-lg border border-line-strong/60 bg-bg-sunken/70 p-4 backdrop-blur-sm sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-eyebrow uppercase text-fg-3">Ma file du jour</p>
            <p className="font-display text-[28px] font-semibold leading-none tabular-nums">
              <CountUp value={file.total} />
            </p>
          </div>
          <div
            role="img"
            aria-label={`${file.en_retard} en retard, ${file.bientot} bientôt dues, ${dansLesDelais} dans les délais`}
            className="mt-3 flex h-2 overflow-hidden rounded-full bg-line"
          >
            {file.total > 0 && (
              <>
                <span
                  className="h-full origin-left animate-bar bg-prio-haute"
                  style={{ width: `${part(file.en_retard)}%` }}
                />
                <span
                  className="h-full origin-left animate-bar bg-st-encours [animation-delay:500ms]"
                  style={{ width: `${part(file.bientot)}%` }}
                />
                <span
                  className="h-full origin-left animate-bar bg-success [animation-delay:600ms]"
                  style={{ width: `${part(dansLesDelais)}%` }}
                />
              </>
            )}
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-[12.5px] text-fg-2">
            {file.total === 0 ? (
              <li className="text-fg-3">
                Aucune demande ne vous est assignée.
              </li>
            ) : (
              <>
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-prio-haute"
                  />
                  <span className="flex-1">Échéance dépassée</span>
                  <b className="tabular-nums text-fg">{file.en_retard}</b>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-st-encours"
                  />
                  <span className="flex-1">Bientôt dues</span>
                  <b className="tabular-nums text-fg">{file.bientot}</b>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-success"
                  />
                  <span className="flex-1">
                    {pluriel(file.a_prendre, "à prendre", "à prendre")} ·{" "}
                    {file.en_cours} en cours
                  </span>
                  <b className="tabular-nums text-fg">{dansLesDelais}</b>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Indicateurs de l'équipe, en petit */}
      <dl className="relative grid grid-cols-2 divide-line border-t border-line bg-bg-sunken/40 sm:grid-cols-4 sm:divide-x">
        {indicateurs.map((k) => (
          <div key={k.label} className="flex flex-col gap-0.5 px-5 py-3.5">
            <dt className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-3">
              {k.label}
              {k.pastille && (
                <span
                  className={cn(
                    "whitespace-nowrap rounded-full px-1.5 py-px text-[10.5px] font-semibold",
                    TONS[k.ton ?? "accent"],
                  )}
                >
                  {k.pastille}
                </span>
              )}
            </dt>
            <dd className="font-display text-[22px] font-semibold leading-tight tabular-nums">
              {k.valeur === null ? (
                <span className="text-fg-4">—</span>
              ) : (
                <>
                  <CountUp value={k.valeur} decimals={k.decimales ?? 0} />
                  {k.unite && (
                    <span className="ml-0.5 text-sm font-medium text-fg-3">
                      {k.unite}
                    </span>
                  )}
                </>
              )}
            </dd>
            <dd className="truncate text-[11.5px] text-fg-4">{k.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
