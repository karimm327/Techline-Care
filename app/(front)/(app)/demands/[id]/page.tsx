import { Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import RestoreButton from "@/components/activity/RestoreButton";
import CommentForm from "@/components/demand/CommentForm";
import FilConversation from "@/components/demand/FilConversation";
import HeroDemande from "@/components/demand/HeroDemande";
import HistoriqueDemande from "@/components/demand/HistoriqueDemande";
import OngletsConversation from "@/components/demand/OngletsConversation";
import PiecesJointes from "@/components/demand/PiecesJointes";
import { IndicateurFrappe, SignalPresence } from "@/components/demand/Presence";
import {
  AbonnesDemande,
  DemandesLiees,
} from "@/components/demand/SuiviDemande";
import TexteAvecLiens from "@/components/demand/TexteAvecLiens";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { estAdmin, estLectureSeule, roleCanonique } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { findActivityByDemand } from "@/lib/db/queries/activity.queries";
import { findPiecesJointes } from "@/lib/db/queries/attachment.queries";
import {
  findCommentsByDemandId,
  findMentionnables,
  findQuickReplies,
} from "@/lib/db/queries/comment.queries";
import {
  countDemandesOuvertesAgent,
  findDemandDetailById,
} from "@/lib/db/queries/demand.queries";
import { findAbonnes, findDemandesLiees } from "@/lib/db/queries/suivi.queries";
import { formaterDuree } from "@/lib/sla";
import { dateCourte, dateHeure, ilYA, pluriel } from "@/lib/ui/format";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function TitreCarte({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-h3">{children}</h2>;
}

export default async function DemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const moi = await requireUser(); // page réservée aux utilisateurs connectés
  const peutModifier = !estLectureSeule(moi.role);
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const demand = await findDemandDetailById(id);
  if (!demand) notFound();

  // Demande supprimée : visible seulement par un ADMIN (pour la consulter / la restaurer)
  const supprimee = !!demand.deleted_at;
  const admin = estAdmin(moi.role);
  if (supprimee && !admin) notFound();
  const peutAgir = peutModifier && !supprimee;

  const [
    comments,
    historique,
    ouvertesAgent,
    mentionnables,
    reponsesRapides,
    pieces,
    abonnes,
    liees,
  ] = await Promise.all([
    findCommentsByDemandId(id, {
      inclureInternes: peutModifier,
      idUtilisateur: moi.id,
    }),
    findActivityByDemand(id),
    demand.id_assigned_agent
      ? countDemandesOuvertesAgent(demand.id_assigned_agent)
      : Promise.resolve(0),
    // Composer (ADMIN / AGENT) : personnes mentionnables et réponses rapides
    peutModifier ? findMentionnables() : Promise.resolve([]),
    peutModifier ? findQuickReplies().catch(() => []) : Promise.resolve([]),
    findPiecesJointes(id).catch(() => []),
    findAbonnes(id).catch(() => []),
    findDemandesLiees(id).catch(() => []),
  ]);
  const publics = comments.filter((c) => !c.is_internal);
  const internes = comments.filter((c) => c.is_internal);
  const noms = mentionnables.map((p) => p.nom);

  // Créateur : colonne created_by (migration v2), sinon l'entrée CREATION du journal
  const createur =
    demand.created_by_name ??
    historique.find((h) => h.action === "CREATION")?.actor_label;
  const creation = `Créée ${ilYA(demand.created_at)}${createur ? ` par ${createur}` : ""}`;

  const zoneSaisie = supprimee ? (
    <div className="mt-5">
      <Alert tone="info">
        Demande supprimée : les commentaires sont fermés.
      </Alert>
    </div>
  ) : peutModifier ? (
    <CommentForm
      demandId={id}
      mentionnables={mentionnables}
      reponsesRapides={reponsesRapides}
    />
  ) : (
    <div className="mt-5">
      <Alert tone="info">
        Votre rôle « Lecture seule » permet de consulter, pas de commenter.
      </Alert>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Vue ADMIN d'une demande supprimée */}
      {supprimee && (
        <section
          aria-label="Demande supprimée"
          className="flex animate-rise flex-wrap items-center gap-3.5 rounded-xl border border-dashed border-danger/45 bg-danger/[.08] p-4"
        >
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-danger text-ink"
          >
            <Trash2 strokeWidth={2.2} className="size-5" />
          </span>
          <div className="min-w-0 flex-[1_1_220px]">
            <p className="font-semibold">
              Supprimée le {dateHeure(demand.deleted_at)}
              {demand.deleted_by_name ? ` par ${demand.deleted_by_name}` : ""}
            </p>
            <p className="mt-0.5 break-words text-[13px] text-fg-1">
              Motif : {demand.delete_reason || "—"}
            </p>
          </div>
          <RestoreButton id={id} />
        </section>
      )}

      <SignalPresence demandId={id} />
      <HeroDemande
        id={id}
        titre={demand.title}
        statut={demand.status}
        priorite={demand.priority}
        categorie={demand.category}
        creation={creation}
        sla={{
          createdAt: demand.created_at,
          dueAt: demand.due_at,
          closedAt: demand.closed_at,
          maintenant: Date.now(),
        }}
        peutAgir={peutAgir}
        lectureSeule={!peutModifier && !supprimee}
        moiId={
          roleCanonique(moi.role) === "AGENT" &&
          demand.id_assigned_agent !== moi.id
            ? moi.id
            : undefined
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        {/* Colonne principale */}
        <div className="flex min-w-0 flex-col gap-5">
          <Card
            as="article"
            className="animate-rise px-5 py-5 [animation-delay:120ms] sm:px-[22px]"
          >
            <TitreCarte>Description</TitreCarte>
            <p className="whitespace-pre-line break-words leading-[1.7] text-fg-1">
              <TexteAvecLiens texte={demand.description} />
            </p>
            <PiecesJointes
              compact
              demandId={id}
              pieces={pieces}
              peutAjouter={false}
              moiId={moi.id}
              admin={admin}
            />
          </Card>

          <Card
            as="article"
            className="animate-rise px-5 py-5 [animation-delay:180ms] sm:px-[22px]"
          >
            <OngletsConversation
              onglets={[
                {
                  value: "commentaires",
                  label: "Commentaires",
                  count: publics.length,
                  contenu: (
                    <>
                      <FilConversation
                        commentaires={publics}
                        noms={noms}
                        peutReagir={peutAgir}
                        vide="Aucun commentaire pour l’instant."
                      />
                      <IndicateurFrappe />
                      {zoneSaisie}
                    </>
                  ),
                },
                // Notes internes : agents et administrateurs seulement
                ...(peutModifier
                  ? [
                      {
                        value: "notes",
                        label: "Notes internes",
                        count: internes.length,
                        contenu: (
                          <>
                            <FilConversation
                              commentaires={internes}
                              noms={noms}
                              peutReagir={peutAgir}
                              vide="Les notes internes ne sont visibles que des agents et administrateurs. Aucune note pour l’instant."
                            />
                            {!supprimee && (
                              <CommentForm
                                demandId={id}
                                interne
                                mentionnables={mentionnables}
                              />
                            )}
                          </>
                        ),
                      },
                    ]
                  : []),
                {
                  value: "pieces",
                  label: "Pièces jointes",
                  count: pieces.length,
                  contenu: (
                    <PiecesJointes
                      demandId={id}
                      pieces={pieces}
                      peutAjouter={peutAgir}
                      moiId={moi.id}
                      admin={admin}
                    />
                  ),
                },
              ]}
            />
          </Card>
        </div>

        {/* Colonne latérale */}
        <aside className="flex min-w-0 flex-col gap-5">
          <Card className="animate-rise px-5 py-5 [animation-delay:160ms] sm:px-[22px]">
            <TitreCarte>Détails</TitreCarte>
            <dl className="divide-y divide-line-soft">
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-fg-3">Catégorie</dt>
                <dd className="text-right font-medium">{demand.category}</dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-fg-3">Créée le</dt>
                <dd className="text-right font-medium">
                  {dateCourte(demand.created_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 py-2.5">
                <dt className="text-fg-3">1re réponse</dt>
                <dd
                  className={
                    demand.first_response_at
                      ? "text-right font-medium text-success-fg"
                      : "text-right font-medium text-fg-3"
                  }
                >
                  {demand.first_response_at
                    ? `en ${formaterDuree(
                        (new Date(demand.first_response_at).getTime() -
                          new Date(demand.created_at).getTime()) /
                          60000,
                      )}`
                    : "En attente"}
                </dd>
              </div>
              {demand.updated_at && (
                <div className="flex justify-between gap-4 py-2.5">
                  <dt className="text-fg-3">Modifiée</dt>
                  <dd
                    className="text-right font-medium"
                    title={dateHeure(demand.updated_at)}
                  >
                    {ilYA(demand.updated_at)}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="animate-rise px-5 py-5 [animation-delay:220ms] sm:px-[22px]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-h3">Agent assigné</h2>
              {peutAgir && (
                <Link
                  href={`/demands/${id}/edit`}
                  className="cible-tactile inline-flex h-[30px] items-center rounded-[8px] px-2.5 text-[12.5px] font-semibold text-accent-fg transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                >
                  {demand.agent_full_name ? "Réassigner" : "Assigner"}
                </Link>
              )}
            </div>
            {demand.agent_full_name && demand.id_assigned_agent ? (
              <div className="flex items-center gap-3 rounded-xl bg-surface-inset p-3">
                <Avatar
                  id={demand.id_assigned_agent}
                  name={demand.agent_full_name}
                  size={42}
                  decorative
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {demand.agent_full_name}
                  </p>
                  <p className="text-[12.5px] text-fg-3">
                    Agent ·{" "}
                    {pluriel(
                      ouvertesAgent,
                      "demande ouverte",
                      "demandes ouvertes",
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="rounded-xl bg-surface-inset p-3 text-fg-3">
                Aucun agent assigné.
              </p>
            )}
            <AbonnesDemande
              demandId={id}
              initiaux={abonnes}
              moiId={moi.id}
              actif={!supprimee}
            />
          </Card>

          <Card className="animate-rise px-5 py-5 [animation-delay:260ms] sm:px-[22px]">
            <h2 className="mb-3 font-display text-h3">Demandes liées</h2>
            <DemandesLiees
              demandId={id}
              initiales={liees}
              peutModifier={peutAgir}
            />
          </Card>

          <Card className="animate-rise px-5 py-5 [animation-delay:300ms] sm:px-[22px]">
            <div className="mb-3.5 flex items-center justify-between gap-3">
              <h2 className="font-display text-h3">Historique</h2>
              {admin && (
                <Link
                  href="/journal"
                  className="rounded-xs text-[12.5px] font-semibold text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                >
                  Journal complet
                </Link>
              )}
            </div>
            <HistoriqueDemande lignes={historique} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
