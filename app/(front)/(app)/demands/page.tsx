import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { detailAction, styleAction } from "@/components/activity/actions";
import BarreFiltres from "@/components/demands/BarreFiltres";
import BasculeVue from "@/components/demands/BasculeVue";
import BoutonExport from "@/components/demands/BoutonExport";
import KanbanBoard from "@/components/demands/KanbanBoard";
import RafraichissementAuto from "@/components/demands/RafraichissementAuto";
import {
  BarreActionsGroupees,
  CaseSelection,
  CaseToutes,
  SelectionDemandes,
} from "@/components/demands/SelectionDemandes";
import ToastSuppression from "@/components/demands/ToastSuppression";
import PageHeader from "@/components/layout/PageHeader";
import SortableHeader from "@/components/SortableHeader";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import { classesBouton } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PriorityBars from "@/components/ui/PriorityBars";
import SlaPill from "@/components/ui/SlaPill";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import {
  findRecentActivity,
  type LigneJournal,
} from "@/lib/db/queries/activity.queries";
import { findAllCategories } from "@/lib/db/queries/category.queries";
import {
  type FiltresDemandes,
  findChargeEquipe,
  findDailyCounts,
  findDemandsFiltrees,
  findDemandsPage,
  findIndicateurs,
  type LigneDemande,
} from "@/lib/db/queries/demand.queries";
import {
  findPreferences,
  PREFERENCES_DEFAUT,
} from "@/lib/db/queries/preference.queries";
import { findAllAgents, findUserById } from "@/lib/db/queries/user.queries";
import { cn } from "@/lib/ui/cn";
import { ilYA, jourLong, pluriel, reference } from "@/lib/ui/format";
import { avatarColor } from "@/lib/ui/status";

const PAR_PAGE = 10;

type Params = {
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  statut?: string;
  priorite?: string;
  categorie?: string;
  agent?: string;
  q?: string;
  sla?: string;
  mode?: string;
};

interface Props {
  searchParams: Promise<Params>;
}

const liste = (v?: string) =>
  (v ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

/* ---------- Blocs ---------- */

function Pagination({
  page,
  totalPages,
  lien,
}: {
  page: number;
  totalPages: number;
  lien: (p: number) => string;
}) {
  if (totalPages <= 1) return null;
  // Numéros affichés : 1 … (page-1) page (page+1) … dernière
  const numeros: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) numeros.push(p);
    else if (numeros[numeros.length - 1] !== "…") numeros.push("…");
  }
  const base =
    "cible-tactile inline-flex h-9 min-w-9 items-center justify-center rounded-[9px] px-2.5 text-[13px] font-semibold transition-colors duration-[180ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft";
  const inactif = `${base} cursor-not-allowed text-fg-4`;
  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      {page > 1 ? (
        <Link
          href={lien(page - 1)}
          className={cn(base, "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          aria-label="Page précédente"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span className={inactif} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}
      {numeros.map((n, i) =>
        n === "…" ? (
          <span key={`e-${numeros[i - 1]}`} className="px-1 text-fg-4">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={lien(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              base,
              n === page
                ? "bg-accent text-white"
                : "text-fg-2 hover:bg-surface-2 hover:text-fg",
            )}
          >
            {n}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          href={lien(page + 1)}
          className={cn(base, "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          aria-label="Page suivante"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span className={inactif} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}

function CelluleAgent({
  d,
  peutModifier,
}: {
  d: LigneDemande;
  peutModifier: boolean;
}) {
  if (d.id_assigned_agent && d.agent_full_name) {
    return (
      <span className="inline-flex items-center gap-2 text-fg-1">
        <Avatar
          id={d.id_assigned_agent}
          name={d.agent_full_name}
          size={26}
          decorative
        />
        <span className="truncate">{d.agent_full_name}</span>
      </span>
    );
  }
  if (!peutModifier) return <span className="text-fg-4">Non assignée</span>;
  return (
    <Link
      href={`/demands/${d.id_demand}/edit`}
      className="cible-tactile inline-flex h-[30px] items-center gap-1.5 rounded-full border border-dashed border-line-hover px-2.5 text-[12.5px] text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
    >
      <Plus aria-hidden="true" strokeWidth={2.2} className="size-3.5" />
      Assigner
      <span className="sr-only"> la demande {d.title}</span>
    </Link>
  );
}

function ActiviteEnDirect({ lignes }: { lignes: LigneJournal[] }) {
  return (
    <Card
      as="article"
      className="animate-rise px-5 py-[18px] [animation-delay:360ms] sm:px-5 sm:py-[18px]"
    >
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-h3">
          Activité en direct
          <span className="inline-flex items-center gap-1.5 rounded-full bg-prio-haute/15 px-2 py-0.5 font-sans text-[11px] font-semibold tracking-[.06em] text-prio-haute-fg">
            <span
              aria-hidden="true"
              className="size-1.5 animate-live rounded-full bg-prio-haute"
            />
            LIVE
          </span>
        </h2>
        <Link
          href="/journal"
          className="rounded-xs text-[13px] font-semibold text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          Journal complet →
        </Link>
      </div>
      {lignes.length === 0 ? (
        <p className="py-6 text-center text-fg-3">
          Aucune activité enregistrée pour l’instant.
        </p>
      ) : (
        <ol className="flex flex-col">
          {lignes.map((l, i) => {
            const s = styleAction(l.action);
            const detail = l.action !== "CREATION" ? detailAction(l) : null;
            return (
              <li
                key={l.id_activity_log}
                className={cn(
                  "flex animate-rise items-start gap-3 py-2.5",
                  i > 0 && "border-t border-line-soft",
                )}
                style={{ animationDelay: `${500 + i * 70}ms` }}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-[9px] font-mono text-xs font-bold",
                    s.pastille,
                  )}
                >
                  {s.lettre}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-fg-1">
                    <span className="font-semibold text-fg">
                      {l.actor_label}
                    </span>{" "}
                    {s.verbe}{" "}
                    {l.id_demand ? (
                      <Link
                        href={`/demands/${l.id_demand}`}
                        className={cn(
                          "rounded-xs font-medium text-accent-fg-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                          l.demand_deleted &&
                            "text-fg-3 line-through decoration-danger",
                        )}
                      >
                        {l.demand_title ?? "une demande"}
                      </Link>
                    ) : (
                      "une demande"
                    )}
                  </p>
                  {detail && (
                    <p className="mt-0.5 truncate text-xs text-fg-3">
                      {detail}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-fg-4">
                    {ilYA(l.created_at)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function ChargeEquipe({
  charge,
}: {
  charge: { id_user: string; nom: string; ouvertes: number }[];
}) {
  const max = Math.max(1, ...charge.map((c) => c.ouvertes));
  return (
    <Card
      as="article"
      className="animate-rise px-5 py-[18px] [animation-delay:420ms] sm:px-5 sm:py-[18px]"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-h3">Charge de l’équipe</h2>
        <span className="text-[12.5px] text-fg-3">
          demandes ouvertes / agent
        </span>
      </div>
      {charge.length === 0 ? (
        <p className="py-6 text-center text-fg-3">Aucun agent actif.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {charge.map((c, i) => (
            <li key={c.id_user} className="flex items-center gap-3">
              <Avatar id={c.id_user} name={c.nom} size={30} decorative />
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex justify-between gap-2 text-[13px]">
                  <span className="truncate text-fg-1">{c.nom}</span>
                  <span className="tabular-nums text-fg-3">
                    {pluriel(c.ouvertes, "demande")}
                  </span>
                </div>
                <div
                  aria-hidden="true"
                  className="h-2 overflow-hidden rounded-full bg-bg-sunken"
                >
                  <div
                    className={cn(
                      "h-full origin-left animate-bar rounded-full",
                      avatarColor(c.id_user),
                    )}
                    style={{
                      width: `${Math.max(6, (c.ouvertes / max) * 100)}%`,
                      animationDelay: `${500 + i * 90}ms`,
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/* ---------- Page ---------- */

export default async function DemandsPage({ searchParams }: Props) {
  const moi = await requireUser(); // page réservée aux utilisateurs connectés
  const peutModifier = !estLectureSeule(moi.role);
  const admin = estAdmin(moi.role);
  const sp = await searchParams;
  const sortBy = sp.sortBy ?? "created_at";
  const sortOrder = sp.sortOrder ?? "DESC";
  const filtres: FiltresDemandes = {
    statuts: liste(sp.statut),
    priorites: liste(sp.priorite),
    categories: liste(sp.categorie),
    agents: liste(sp.agent),
    sla: liste(sp.sla),
    q: sp.q,
  };
  const pageDemandee = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  // Sans ?mode : vue par défaut choisie dans Mon compte › Préférences
  const prefs = await findPreferences(moi.id).catch(() => PREFERENCES_DEFAUT);
  const mode =
    (sp.mode ?? prefs.default_view) === "kanban" ? "kanban" : "liste";

  let donnees: Awaited<ReturnType<typeof charger>>;
  async function charger() {
    const [pageListe, indicateurs, series, profil, categories, agents] =
      await Promise.all([
        findDemandsPage({
          filtres,
          sortBy,
          sortOrder,
          page: pageDemandee,
          parPage: PAR_PAGE,
        }),
        findIndicateurs(),
        findDailyCounts(14),
        findUserById(moi.id),
        findAllCategories(),
        findAllAgents(),
      ]);
    // Kanban : toutes les demandes filtrées (pas de pagination)
    const kanban =
      mode === "kanban" ? await findDemandsFiltrees(filtres, 500) : [];
    const [activite, charge] = await Promise.all([
      admin ? findRecentActivity(5).catch(() => []) : Promise.resolve([]),
      findChargeEquipe().catch(() => []),
    ]);
    return {
      pageListe,
      indicateurs,
      series,
      profil,
      categories,
      agents,
      activite,
      charge,
      kanban,
    };
  }
  try {
    donnees = await charger();
  } catch (error) {
    console.error(error);
    return (
      <div className="flex flex-col gap-6">
        <PageHeader eyebrow="Pilotage" title="Tableau de bord" />
        <Alert tone="danger" title="Impossible de charger les demandes">
          La connexion au serveur a échoué. Vos données ne sont pas perdues.
        </Alert>
      </div>
    );
  }

  const { pageListe, indicateurs: k, series, profil } = donnees;
  const total = pageListe.total;
  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));
  const page = Math.min(pageDemandee, totalPages);
  const debut = (page - 1) * PAR_PAGE;
  const ouvertes = k.nouvelles + k.en_cours;
  const maintenant = Date.now();
  const prenom = profil?.first_name ?? "";

  const lienPage = (p: number) => {
    const params = new URLSearchParams();
    for (const [cle, valeur] of Object.entries(sp)) {
      if (valeur && cle !== "page" && cle !== "supprimee")
        params.set(cle, valeur);
    }
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return `/demands${q ? `?${q}` : ""}`;
  };

  const sousTitre =
    k.nouvelles === 0
      ? "Tout est à jour."
      : `${pluriel(k.nouvelles, "demande")} ${k.nouvelles > 1 ? "attendent" : "attend"} une prise en charge${
          k.nouvelles_hautes > 0
            ? `, dont ${k.nouvelles_hautes} en priorité haute`
            : ""
        }.`;

  const filtree = Object.values(filtres).some((v) =>
    Array.isArray(v) ? v.length > 0 : !!v?.trim(),
  );
  const nomJour = jourLong();

  return (
    <div className="flex flex-col gap-6">
      <ToastSuppression admin={admin} />
      {admin && <RafraichissementAuto />}

      <PageHeader
        eyebrow={`Pilotage · ${nomJour}`}
        title={prenom ? `Bonjour ${prenom}` : "Bonjour"}
        subtitle={sousTitre}
        actions={
          <>
            <BasculeVue mode={mode} />
            <BoutonExport />
          </>
        }
      />

      {/* Indicateurs */}
      <section
        aria-label="Indicateurs"
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4"
      >
        <StatCard
          index={0}
          label="Demandes ouvertes"
          value={ouvertes}
          trend={
            k.creees_aujourdhui > 0
              ? `+${k.creees_aujourdhui} aujourd’hui`
              : undefined
          }
          tone="accent"
          spark={series.map((j) => j.creees)}
          hint={`${pluriel(k.nouvelles, "nouvelle")} · ${k.en_cours} en cours`}
        />
        <StatCard
          index={1}
          label="Non assignées"
          value={k.non_assignees}
          trend={
            k.non_assignees_urgentes > 0
              ? pluriel(k.non_assignees_urgentes, "urgente")
              : undefined
          }
          tone="late"
          spark={series.map((j) => j.sans_agent)}
          hint="À répartir dans l’équipe"
        />
        <StatCard
          index={2}
          label="1re réponse moyenne"
          value={k.premiere_reponse_h}
          decimals={1}
          unit="h"
          trend={
            k.sla_depasses > 0
              ? `${pluriel(k.sla_depasses, "SLA dépassé", "SLA dépassés")}`
              : undefined
          }
          tone={k.sla_depasses > 0 ? "late" : "done"}
          spark={series.map((j) => j.reponse_h)}
          hint={
            k.premiere_reponse_h === null
              ? "Aucune réponse sur 30 jours"
              : k.objectif_reponse_h
                ? `Sur 30 jours · objectif moyen ${Math.round(k.objectif_reponse_h * 10) / 10} h`
                : "Sur 30 jours"
          }
        />
        <StatCard
          index={3}
          label="Clôturées (7 jours)"
          value={k.cloturees_7j}
          tone="warn"
          spark={series.map((j) => j.cloturees)}
          hint="Passages au statut Clôturée"
        />
      </section>

      <BarreFiltres
        categories={donnees.categories.map((c: { label: string }) => c.label)}
        agents={donnees.agents.map(
          (a: { id_user: string; first_name: string; last_name: string }) => ({
            id: a.id_user,
            nom: `${a.first_name} ${a.last_name}`,
          }),
        )}
      />

      {mode === "kanban" && (
        <KanbanBoard
          demandes={donnees.kanban}
          peutModifier={peutModifier}
          maintenant={maintenant}
        />
      )}

      {/* Vue liste */}
      {mode === "liste" && (
        <SelectionDemandes ids={pageListe.lignes.map((d) => d.id_demand)}>
          <section
            aria-labelledby="titre-liste"
            className="animate-rise overflow-hidden rounded-md border border-line bg-surface [animation-delay:280ms]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-[18px] py-3.5">
              <h2 id="titre-liste" className="font-display text-h3">
                {filtree ? "Demandes filtrées" : "Toutes les demandes"}
              </h2>
              {total > 0 && (
                <p className="text-[12.5px] tabular-nums text-fg-3">
                  {debut + 1}–{Math.min(debut + PAR_PAGE, total)} sur {total}
                </p>
              )}
            </div>

            {peutModifier && total > 0 && (
              <BarreActionsGroupees
                agents={donnees.agents.map(
                  (a: {
                    id_user: string;
                    first_name: string;
                    last_name: string;
                  }) => ({
                    id: a.id_user,
                    nom: `${a.first_name} ${a.last_name}`,
                  }),
                )}
              />
            )}

            {total === 0 ? (
              filtree ? (
                <EmptyState
                  title="Aucune demande ne correspond"
                  text="Modifiez ou effacez les filtres pour élargir la recherche."
                />
              ) : (
                <EmptyState
                  title="Aucune demande pour l’instant"
                  text={
                    peutModifier
                      ? "Créez la première pour démarrer le suivi."
                      : "Les demandes créées par l’équipe apparaîtront ici."
                  }
                  action={
                    peutModifier ? (
                      <Link href="/demands/new" className={classesBouton()}>
                        <Plus
                          aria-hidden="true"
                          strokeWidth={2.2}
                          className="size-4"
                        />
                        Nouvelle demande
                      </Link>
                    ) : undefined
                  }
                />
              )
            ) : (
              <>
                {/* Tableau (tablette et ordinateur) */}
                <div className="hidden overflow-x-auto overflow-y-hidden md:block">
                  <table className="w-full min-w-[920px] border-collapse text-[13.5px]">
                    <thead>
                      <tr className="bg-surface-inset text-[11.5px] text-fg-3">
                        {peutModifier && (
                          <th scope="col" className="w-11 py-2.5 pl-[18px]">
                            <CaseToutes />
                          </th>
                        )}
                        <SortableHeader
                          label="Demande"
                          field="title"
                          className={peutModifier ? "" : "pl-[18px]"}
                        />
                        <SortableHeader label="Statut" field="status" />
                        <SortableHeader label="Priorité" field="priority" />
                        <SortableHeader label="Catégorie" field="category" />
                        <SortableHeader label="Agent" field="agent" />
                        <SortableHeader label="SLA" field="sla" />
                        <SortableHeader
                          label="Mise à jour"
                          field="updated_at"
                          className="pr-[18px] text-right"
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {pageListe.lignes.map((d, i) => (
                        <tr
                          key={d.id_demand}
                          className="group animate-rise transition-colors duration-[180ms] hover:bg-surface-row has-[:checked]:bg-accent/10"
                          style={{ animationDelay: `${320 + i * 45}ms` }}
                        >
                          {peutModifier && (
                            <td className="border-t border-line-soft py-3 pl-[18px]">
                              <CaseSelection id={d.id_demand} titre={d.title} />
                            </td>
                          )}
                          <td
                            className={cn(
                              "max-w-[340px] border-t border-line-soft py-3 pr-3",
                              peutModifier ? "pl-3" : "pl-[18px]",
                            )}
                          >
                            <Link
                              href={`/demands/${d.id_demand}`}
                              className="block truncate rounded-xs font-semibold text-fg transition-colors duration-[180ms] group-hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                            >
                              {d.title}
                            </Link>
                            <span className="font-mono text-[11.5px] text-fg-4">
                              {reference(d.id_demand)}
                            </span>
                          </td>
                          <td className="border-t border-line-soft p-3">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="border-t border-line-soft p-3">
                            <PriorityBars priority={d.priority} />
                          </td>
                          <td className="border-t border-line-soft p-3 text-fg-2">
                            {d.category}
                          </td>
                          <td className="max-w-[220px] border-t border-line-soft p-3">
                            <CelluleAgent d={d} peutModifier={peutModifier} />
                          </td>
                          <td className="border-t border-line-soft p-3">
                            <SlaPill
                              statut={d.status}
                              createdAt={d.created_at}
                              dueAt={d.due_at}
                              closedAt={d.closed_at}
                              maintenant={maintenant}
                            />
                          </td>
                          <td
                            className="whitespace-nowrap border-t border-line-soft py-3 pl-3 pr-[18px] text-right text-fg-3"
                            title={new Date(d.updated_at).toLocaleString(
                              "fr-FR",
                            )}
                          >
                            {ilYA(d.updated_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cartes (mobile) */}
                <ul className="divide-y divide-line-soft md:hidden">
                  {pageListe.lignes.map((d, i) => (
                    <li
                      key={d.id_demand}
                      className="animate-rise p-4 has-[:checked]:bg-accent/10"
                      style={{ animationDelay: `${320 + i * 45}ms` }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {peutModifier && (
                          <span className="pt-0.5">
                            <CaseSelection id={d.id_demand} titre={d.title} />
                          </span>
                        )}
                        <Link
                          href={`/demands/${d.id_demand}`}
                          className="min-w-0 flex-1 rounded-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                        >
                          <p className="truncate font-semibold text-fg">
                            {d.title}
                          </p>
                          <p className="mt-0.5 font-mono text-[11.5px] text-fg-4">
                            {reference(d.id_demand)} · {ilYA(d.updated_at)}
                          </p>
                        </Link>
                        <StatusBadge status={d.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <PriorityBars priority={d.priority} />
                        <span className="text-[13px] text-fg-3">
                          {d.category}
                        </span>
                        <SlaPill
                          statut={d.status}
                          createdAt={d.created_at}
                          dueAt={d.due_at}
                          closedAt={d.closed_at}
                          maintenant={maintenant}
                        />
                      </div>
                      <div className="mt-3">
                        <CelluleAgent d={d} peutModifier={peutModifier} />
                      </div>
                    </li>
                  ))}
                </ul>

                {totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-[18px] py-3.5 sm:flex-row">
                    <p className="text-[12.5px] text-fg-3">
                      Page {page} sur {totalPages}
                    </p>
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      lien={lienPage}
                    />
                  </div>
                )}
              </>
            )}
          </section>
        </SelectionDemandes>
      )}

      {/* Bas de page : activité (ADMIN) et charge de l'équipe (ADMIN, AGENT) */}
      {(admin || peutModifier) && (
        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] gap-4">
          {admin && <ActiviteEnDirect lignes={donnees.activite} />}
          <ChargeEquipe charge={donnees.charge} />
        </section>
      )}
    </div>
  );
}
