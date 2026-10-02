import { Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import RestoreButton from "@/components/activity/RestoreButton";
import CommentForm from "@/components/demand/CommentForm";
import HeroDemande from "@/components/demand/HeroDemande";
import HistoriqueDemande from "@/components/demand/HistoriqueDemande";
import OngletsConversation from "@/components/demand/OngletsConversation";
import TexteAvecLiens from "@/components/demand/TexteAvecLiens";
import Alert from "@/components/ui/Alert";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { findActivityByDemand } from "@/lib/db/queries/activity.queries";
import { findCommentsByDemandId } from "@/lib/db/queries/comment.queries";
import {
  countDemandesOuvertesAgent,
  findDemandDetailById,
} from "@/lib/db/queries/demand.queries";
import { dateCourte, dateHeure, heure, ilYA, pluriel } from "@/lib/ui/format";

type Commentaire = {
  id_comment: string;
  id_author: string;
  content: string;
  created_at: string;
  author_first_name?: string;
  author_last_name?: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// « aujourd'hui à 10:48 », « 30 sept. 2026 à 09:12 »
function quand(d: string) {
  const date = new Date(d);
  const aujourdhui = new Date().toDateString() === date.toDateString();
  return `${aujourdhui ? "aujourd’hui" : dateCourte(date)} à ${heure(date)}`;
}

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

  const [comments, historique, ouvertesAgent] = await Promise.all([
    findCommentsByDemandId(id) as Promise<Commentaire[]>,
    findActivityByDemand(id),
    demand.id_assigned_agent
      ? countDemandesOuvertesAgent(demand.id_assigned_agent)
      : Promise.resolve(0),
  ]);

  const createur = historique.find((h) => h.action === "CREATION")?.actor_label;
  const creation = `Créée ${ilYA(demand.created_at)}${createur ? ` par ${createur}` : ""}`;

  const listeCommentaires =
    comments.length === 0 ? (
      <p className="rounded-xl bg-surface-inset px-4 py-6 text-center text-fg-3">
        Aucun commentaire pour l’instant.
      </p>
    ) : (
      <ol className="flex flex-col gap-[18px]">
        {comments.map((c, i) => {
          const auteur =
            `${c.author_first_name ?? ""} ${c.author_last_name ?? ""}`.trim() ||
            "Utilisateur";
          return (
            <li
              key={c.id_comment}
              className="flex animate-rise gap-3"
              style={{ animationDelay: `${250 + Math.min(i, 8) * 70}ms` }}
            >
              <Avatar id={c.id_author} name={auteur} size={36} decorative />
              <div className="min-w-0 flex-1">
                <p className="text-[13px]">
                  <span className="font-semibold">{auteur}</span>
                  <span className="text-fg-4">
                    {" "}
                    ·{" "}
                    <time
                      dateTime={c.created_at}
                      title={dateHeure(c.created_at)}
                    >
                      {quand(c.created_at)}
                    </time>
                  </span>
                </p>
                <p className="mt-1.5 inline-block max-w-full whitespace-pre-line break-words rounded-[4px_14px_14px_14px] bg-surface-2 px-3.5 py-2.5 text-fg-1">
                  <TexteAvecLiens texte={c.content} />
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    );

  const zoneSaisie = supprimee ? (
    <div className="mt-5">
      <Alert tone="info">
        Demande supprimée : les commentaires sont fermés.
      </Alert>
    </div>
  ) : peutModifier ? (
    <CommentForm demandId={id} />
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

      <HeroDemande
        id={id}
        titre={demand.title}
        statut={demand.status}
        priorite={demand.priority}
        categorie={demand.category}
        creation={creation}
        peutAgir={peutAgir}
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
                  count: comments.length,
                  contenu: (
                    <>
                      {listeCommentaires}
                      {zoneSaisie}
                    </>
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
