import Link from "next/link";
import { redirect } from "next/navigation";
import { styleAction } from "@/components/activity/actions";
import RestoreButton from "@/components/activity/RestoreButton";
import {
  FiltrePeriode,
  RechercheJournal,
} from "@/components/journal/FiltresJournal";
import PageHeader from "@/components/layout/PageHeader";
import { classesBouton } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { estAdmin } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import {
  ACTIONS,
  countJournalParAction,
  type FiltresJournal,
  findJournal,
  type LigneJournal,
} from "@/lib/db/queries/activity.queries";
import { analyserDetails } from "@/lib/demandes/changements";
import { cn } from "@/lib/ui/cn";
import { dateHeure, heure } from "@/lib/ui/format";
import { libellePriorite, libelleStatut } from "@/lib/ui/status";

const PAR_LOT = 30;

// Symbole de chaque action dans la frise (maquette Journal)
const SYMBOLES: Record<string, string> = {
  CREATION: "+",
  MODIFICATION: "~",
  SUPPRESSION: "×",
  RESTAURATION: "↺",
  COMMENTAIRE: "“",
};

const LIBELLES_COMPTEURS: Record<string, string> = {
  CREATION: "Création",
  MODIFICATION: "Modification",
  SUPPRESSION: "Suppression",
  RESTAURATION: "Restauration",
  COMMENTAIRE: "Commentaire",
};

interface Props {
  searchParams: Promise<{
    action?: string;
    q?: string;
    du?: string;
    au?: string;
    n?: string;
  }>;
}

// « Aujourd'hui », « Hier », « mardi 30 septembre »
function libelleJour(d: Date) {
  const jour = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  const ecart = Math.round((aujourdhui.getTime() - jour.getTime()) / 86400000);
  if (ecart === 0) return "Aujourd’hui";
  if (ecart === 1) return "Hier";
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year:
      jour.getFullYear() === aujourdhui.getFullYear() ? undefined : "numeric",
  });
}

const lisible = (champ: string, v: string) =>
  champ === "Statut"
    ? libelleStatut(v)
    : champ === "Priorité"
      ? libellePriorite(v)
      : v;

function Evenement({ l, rang }: { l: LigneJournal; rang: number }) {
  const s = styleAction(l.action);
  const { changements, autres } =
    l.action === "MODIFICATION"
      ? analyserDetails(l.details)
      : { changements: [], autres: [] };
  return (
    <li
      className="relative flex animate-rise items-start gap-3.5 rounded-r-xl py-3 pl-[26px] pr-3 transition-colors duration-[180ms] hover:bg-surface-row"
      style={{ animationDelay: `${180 + Math.min(rang, 10) * 55}ms` }}
    >
      <span
        aria-hidden="true"
        className="absolute -left-[15px] top-3 flex size-7 items-center justify-center rounded-full bg-surface font-bold ring-4 ring-surface"
      >
        <span
          className={cn(
            "flex size-full items-center justify-center rounded-full text-sm",
            s.pastille,
          )}
        >
          {SYMBOLES[l.action] ?? "·"}
        </span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-fg-1">
          <span className="font-semibold text-fg">{l.actor_label}</span> ·{" "}
          <span
            className={cn(
              "rounded-full px-2 py-px text-xs font-semibold",
              s.pastille,
            )}
          >
            {s.label}
          </span>
          {l.id_demand && (
            <>
              {" · "}
              <Link
                href={`/demands/${l.id_demand}`}
                className={cn(
                  "rounded-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                  l.demand_deleted
                    ? "text-fg-3 line-through decoration-danger"
                    : "font-medium text-accent-fg-2 hover:underline",
                )}
              >
                {l.demand_title ?? "Demande"}
              </Link>
              {l.demand_deleted && (
                <span className="sr-only"> (supprimée)</span>
              )}
            </>
          )}
        </p>
        {changements.map((c) => (
          <p key={c.champ} className="mt-1.5 text-[12.5px] text-fg-3">
            {c.champ} :{" "}
            <del className="text-fg-4 decoration-fg-4">
              {lisible(c.champ, c.avant)}
            </del>{" "}
            →{" "}
            <span className="font-medium text-fg">
              {lisible(c.champ, c.apres)}
            </span>
          </p>
        ))}
        {autres.length > 0 && (
          <p className="mt-1.5 text-[12.5px] text-fg-3">{autres.join(" · ")}</p>
        )}
        {l.action === "SUPPRESSION" && l.details && (
          <p className="mt-1.5 text-[12.5px] text-danger-fg">
            Motif : {l.details}
          </p>
        )}
        {l.action === "COMMENTAIRE" && l.details && (
          <p className="mt-1.5 line-clamp-2 text-[12.5px] italic text-fg-3">
            « {l.details} »
          </p>
        )}
      </div>
      {l.action === "SUPPRESSION" && l.demand_deleted && l.id_demand && (
        <RestoreButton id={l.id_demand} variante="lien" />
      )}
      <time
        dateTime={l.created_at}
        title={dateHeure(l.created_at)}
        className="whitespace-nowrap pt-0.5 text-xs text-fg-4"
      >
        {heure(l.created_at)}
      </time>
    </li>
  );
}

export default async function JournalPage({ searchParams }: Props) {
  const moi = await requireUser();
  if (!estAdmin(moi.role)) redirect("/demands"); // réservé aux administrateurs

  const sp = await searchParams;
  const filtres: FiltresJournal = {
    action:
      sp.action && (ACTIONS as readonly string[]).includes(sp.action)
        ? sp.action
        : undefined,
    q: sp.q,
    du: sp.du,
    au: sp.au,
  };
  const limite = Math.min(
    600,
    Math.max(PAR_LOT, Number.parseInt(sp.n ?? "", 10) || PAR_LOT),
  );

  const [{ lignes, total }, parAction] = await Promise.all([
    findJournal(filtres, limite),
    countJournalParAction(filtres),
  ]);
  const max = Math.max(1, ...Object.values(parAction));

  // Lien qui conserve les autres filtres
  const lien = (changements: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) p.set(k, v);
    for (const [k, v] of Object.entries(changements)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const q = p.toString();
    return `/journal${q ? `?${q}` : ""}`;
  };

  // Regroupement par jour (les lignes arrivent du plus récent au plus ancien)
  const jours: { label: string; lignes: LigneJournal[] }[] = [];
  for (const l of lignes) {
    const label = libelleJour(new Date(l.created_at));
    const dernier = jours[jours.length - 1];
    if (dernier?.label === label) dernier.lignes.push(l);
    else jours.push({ label, lignes: [l] });
  }

  let rang = 0;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Administration"
        title="Journal d’activité"
        subtitle="Toutes les actions tracées : créations, modifications, suppressions, restaurations et commentaires."
        actions={<FiltrePeriode />}
      />

      <section
        aria-label="Répartition par action (cliquer pour filtrer)"
        className="grid animate-rise grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3 [animation-delay:80ms]"
      >
        {ACTIONS.map((a, i) => {
          const s = styleAction(a);
          const actif = filtres.action === a;
          const n = parAction[a] ?? 0;
          return (
            <Link
              key={a}
              href={lien({ action: actif ? null : a, n: null })}
              aria-current={actif ? "true" : undefined}
              scroll={false}
              className={cn(
                "flex flex-col gap-1.5 rounded-[14px] border px-4 py-3.5 transition-[transform,box-shadow,border-color,background-color] duration-[280ms] ease-out",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
                "[@media(hover:hover)]:hover:-translate-y-[3px] [@media(hover:hover)]:hover:shadow-md",
                actif
                  ? "border-accent-fg/60 bg-accent/[.12]"
                  : "border-line bg-surface hover:border-line-hover",
              )}
            >
              <span className="flex items-center gap-2 text-[13px] text-fg-2">
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", s.point)}
                />
                {LIBELLES_COMPTEURS[a]}
                {actif && <span className="sr-only"> (filtre actif)</span>}
              </span>
              <span className="font-display text-[28px] font-semibold tabular-nums text-fg">
                {n.toLocaleString("fr-FR")}
              </span>
              <span
                aria-hidden="true"
                className="block h-1 overflow-hidden rounded-full bg-bg-sunken"
              >
                <span
                  className={cn(
                    "block h-full origin-left animate-bar rounded-full",
                    s.point,
                  )}
                  style={{
                    width: `${Math.round((n / max) * 100)}%`,
                    animationDelay: `${300 + i * 80}ms`,
                  }}
                />
              </span>
            </Link>
          );
        })}
      </section>

      <section
        aria-label="Événements"
        className="animate-rise rounded-md border border-line bg-surface px-4 pb-5 pt-1.5 [animation-delay:140ms] sm:px-6"
      >
        <RechercheJournal total={total} />

        {lignes.length === 0 ? (
          <EmptyState
            title="Aucun événement"
            text="Aucune action ne correspond à ces filtres."
          />
        ) : (
          jours.map((j) => (
            <div key={j.label} className="mt-[18px]">
              <h2 className="sticky top-14 z-[1] -mx-1 mb-2.5 bg-surface/95 px-1 py-1 text-eyebrow uppercase text-fg-4 backdrop-blur-sm">
                {j.label}
              </h2>
              <ol className="ml-3.5 border-l-2 border-line">
                {j.lignes.map((l) => {
                  rang += 1;
                  return (
                    <Evenement key={l.id_activity_log} l={l} rang={rang} />
                  );
                })}
              </ol>
            </div>
          ))
        )}

        {lignes.length < total && (
          <div className="mt-5 flex justify-center">
            <Link
              href={lien({ n: String(limite + PAR_LOT) })}
              scroll={false}
              className={classesBouton({ variant: "secondary" })}
            >
              Charger plus d’événements
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
