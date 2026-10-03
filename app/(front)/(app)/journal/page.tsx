import {
  type LucideIcon,
  MessageSquare,
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { styleAction } from "@/components/activity/actions";
import RestoreButton from "@/components/activity/RestoreButton";
import {
  FiltrePeriode,
  RechercheJournal,
} from "@/components/journal/FiltresJournal";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
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

// 10 événements par page (limite la surcharge visuelle)
const PAR_PAGE = 10;

// Symbole de chaque action dans la frise (maquette Journal)
const SYMBOLES: Record<string, string> = {
  CREATION: "+",
  MODIFICATION: "~",
  SUPPRESSION: "×",
  RESTAURATION: "↺",
  COMMENTAIRE: "“",
};

const LIBELLES_COMPTEURS: Record<string, string> = {
  CREATION: "Créations",
  MODIFICATION: "Modifications",
  SUPPRESSION: "Suppressions",
  RESTAURATION: "Restaurations",
  COMMENTAIRE: "Commentaires",
  PIECE_JOINTE: "Pièces jointes",
};

// Icône et couleur de chaque compteur
const ICONES_ACTIONS: Record<string, LucideIcon> = {
  CREATION: Plus,
  MODIFICATION: Pencil,
  SUPPRESSION: Trash2,
  RESTAURATION: RotateCcw,
  COMMENTAIRE: MessageSquare,
  PIECE_JOINTE: Paperclip,
};
const COULEURS_ICONES: Record<string, string> = {
  CREATION: "text-st-nouvelle-fg",
  MODIFICATION: "text-st-encours-fg",
  SUPPRESSION: "text-danger-fg",
  RESTAURATION: "text-success-fg",
  COMMENTAIRE: "text-accent-fg",
  PIECE_JOINTE: "text-fg-2",
};

interface Props {
  searchParams: Promise<{
    action?: string;
    q?: string;
    du?: string;
    au?: string;
    page?: string;
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
  const pageDemandee = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ lignes, total }, parAction] = await Promise.all([
    findJournal(filtres, PAR_PAGE, (pageDemandee - 1) * PAR_PAGE),
    countJournalParAction(filtres),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const page = Math.min(pageDemandee, totalPages);

  // Lien qui conserve les autres filtres
  const lien = (changements: Record<string, string | null>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v) p.set(k, v);
    // Tout changement de filtre revient à la page 1
    if (!("page" in changements)) p.delete("page");
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

      {/* Répartition compacte, alignée à gauche : icône + nombre + libellé, clic = filtre */}
      <nav
        aria-label="Répartition par action (cliquer pour filtrer)"
        className="-mt-2 flex flex-wrap items-center gap-x-1 gap-y-1"
      >
        {ACTIONS.map((a) => {
          const Icone = ICONES_ACTIONS[a];
          const actif = filtres.action === a;
          const estompe = !!filtres.action && !actif;
          const n = parAction[a] ?? 0;
          return (
            <Link
              key={a}
              href={lien({ action: actif ? null : a, page: null })}
              aria-current={actif ? "true" : undefined}
              scroll={false}
              className={cn(
                "cible-tactile inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2 text-xs transition-[opacity,background-color] duration-[180ms]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                actif
                  ? "bg-surface-2 text-fg"
                  : "text-fg-3 hover:bg-surface-2 hover:text-fg-1",
                estompe && "opacity-50",
              )}
            >
              <Icone
                aria-hidden="true"
                strokeWidth={2}
                className={cn("size-3.5", COULEURS_ICONES[a])}
              />
              <span className="font-semibold tabular-nums text-fg">
                {n.toLocaleString("fr-FR")}
              </span>
              {LIBELLES_COMPTEURS[a].toLowerCase()}
              {actif && <span className="sr-only"> (filtre actif)</span>}
            </Link>
          );
        })}
        {filtres.action && (
          <Link
            href={lien({ action: null, page: null })}
            scroll={false}
            className="cible-tactile inline-flex h-7 items-center rounded-[7px] px-2 text-xs font-semibold text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            Tout afficher
          </Link>
        )}
      </nav>

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

        {totalPages > 1 && (
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-line pt-4 sm:flex-row">
            <p className="text-[12.5px] tabular-nums text-fg-3">
              {(page - 1) * PAR_PAGE + 1}–{Math.min(page * PAR_PAGE, total)} sur{" "}
              {total} · page {page} sur {totalPages}
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              lien={(p) => lien({ page: p > 1 ? String(p) : null })}
            />
          </div>
        )}
      </section>
    </div>
  );
}
