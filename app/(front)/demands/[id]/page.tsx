import { notFound } from "next/navigation";
import { findDemandDetailById } from "@/lib/db/queries/demand.queries";
import { findCommentsByDemandId } from "@/lib/db/queries/comment.queries";
import CommentForm from "@/components/demand/CommentForm";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { findActivityByDemand } from "@/lib/db/queries/activity.queries";
import RestoreButton from "@/components/activity/RestoreButton";
import { dateHeure, ilYA, styleAction, detailAction } from "@/components/activity/actions";

/* Palette Veraba : noir + vert profond */
const STATUTS: Record<string, { label: string; badge: string }> = {
    NOUVELLE: { label: "Nouvelle", badge: "bg-[#efefef] text-[#111]" },
    EN_COURS: { label: "En cours", badge: "bg-[#111] text-white" },
    CLOTUREE: { label: "Clôturée", badge: "bg-[#e6f0eb] text-[#0f3d2e]" },
    ANNULEE: { label: "Annulée", badge: "bg-white text-[#6b6b6b] ring-1 ring-[#cfcfcf]" },
};

const PRIORITES: Record<string, { label: string; niveau: number; couleur: string }> = {
    BASSE: { label: "Basse", niveau: 1, couleur: "bg-[#9a9a9a]" },
    NORMALE: { label: "Normale", niveau: 2, couleur: "bg-[#111]" },
    HAUTE: { label: "Haute", niveau: 3, couleur: "bg-red-600" },
};

const ETAPES = [
    { code: "NOUVELLE", label: "Nouvelle" },
    { code: "EN_COURS", label: "En cours" },
    { code: "CLOTUREE", label: "Clôturée" },
];

const initiales = (nom: string) => nom.split(" ").filter(Boolean).map((m) => m[0]).join("").slice(0, 2).toUpperCase();
const dateLongue = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const heure = (d: string) => new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function depuis(d: string) {
    const jours = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
    if (jours <= 0) return "aujourd'hui";
    if (jours === 1) return "hier";
    if (jours < 30) return `il y a ${jours} jours`;
    return `il y a ${Math.floor(jours / 30)} mois`;
}

function Carte({ titre, icone, droite, children }: { titre: string; icone: React.ReactNode; droite?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-2xl border border-[#e6e6e6] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-[#111] text-white flex items-center justify-center">{icone}</span>
                    <h2 className="text-base font-semibold text-[#111]">{titre}</h2>
                </div>
                {droite}
            </div>
            {children}
        </section>
    );
}

function Ligne({ libelle, children }: { libelle: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-[#6b6b6b]">{libelle}</dt>
            <dd className="text-sm font-medium text-[#111] text-right">{children}</dd>
        </div>
    );
}

export default async function DemandDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const moi = await requireUser(); // page réservée aux utilisateurs connectés
    const peutModifier = !estLectureSeule(moi.role);
    const { id } = await params;

    const demand = await findDemandDetailById(id);
    if (!demand) notFound();

    // Demande supprimée : visible seulement par un ADMIN (pour la consulter / la restaurer)
    const supprimee = !!demand.deleted_at;
    const admin = estAdmin(moi.role);
    if (supprimee && !admin) notFound();
    const peutAgir = peutModifier && !supprimee;

    const [comments, historique] = await Promise.all([findCommentsByDemandId(id), findActivityByDemand(id)]);

    const statut = STATUTS[demand.status] ?? { label: demand.status, badge: "bg-[#efefef] text-[#111]" };
    const priorite = PRIORITES[demand.priority] ?? { label: demand.priority, niveau: 0, couleur: "bg-[#9a9a9a]" };
    const etapeActuelle = ETAPES.findIndex((e) => e.code === demand.status);
    const annulee = demand.status === "ANNULEE";

    return (
        <div className="min-h-full bg-[#f6f6f6]">
            {/* ===== Bandeau noir, filet vert ===== */}
            <div className="bg-[#0b0b0b] border-b-[3px] border-[#0f3d2e]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-20">
                    <Link href="/demands" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
                        <span className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        </span>
                        Retour aux demandes
                    </Link>

                    <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#7fc8a9]">Demande #{id.slice(0, 8).toUpperCase()}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 break-words">{demand.title}</h1>
                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statut.badge}`}>{statut.label}</span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white">{demand.category}</span>
                                <span className="text-xs text-white/60">Créée {depuis(demand.created_at)}</span>
                            </div>
                        </div>

                        {peutAgir && <Link
                            href={`/demands/${id}/edit`}
                            className="inline-flex items-center justify-center gap-2 self-start lg:self-auto px-6 py-3 rounded-full bg-white text-[#111] text-sm font-semibold hover:bg-[#0f3d2e] hover:text-white transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            Modifier
                        </Link>}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 pb-14">
                {/* ===== Demande supprimée (vue ADMIN) ===== */}
                {supprimee && (
                    <section className="relative z-10 mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                        <span className="w-11 h-11 shrink-0 rounded-full bg-red-600 text-white flex items-center justify-center">
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-red-800">
                                Demande supprimée le {dateHeure(demand.deleted_at)}{demand.deleted_by_name ? ` par ${demand.deleted_by_name}` : ""}
                            </p>
                            <p className="text-sm text-red-700 mt-1 break-words"><span className="font-medium">Motif :</span> {demand.delete_reason || "—"}</p>
                            <p className="text-xs text-red-600/80 mt-1">Elle n&apos;apparaît plus dans la liste. Restaure-la pour la rendre à nouveau visible et modifiable.</p>
                        </div>
                        <RestoreButton id={id} />
                    </section>
                )}

                {/* ===== Suivi ===== */}
                <section className="bg-white rounded-2xl border border-[#e6e6e6] shadow-[0_10px_30px_-18px_rgba(0,0,0,.35)] p-5 sm:p-6 mb-6">
                    {annulee ? (
                        <p className="text-sm font-medium text-[#6b6b6b]">Cette demande a été annulée.</p>
                    ) : (
                        <ol className="grid grid-cols-3">
                            {ETAPES.map((e, i) => {
                                const faite = i <= etapeActuelle;
                                const courante = i === etapeActuelle;
                                return (
                                    <li key={e.code} className="relative flex flex-col items-center text-center">
                                        {i > 0 && (
                                            <span className={`absolute top-4 right-1/2 w-full h-[3px] -translate-y-1/2 ${i <= etapeActuelle ? "bg-[#0f3d2e]" : "bg-[#e6e6e6]"}`} />
                                        )}
                                        <span
                                            className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                faite ? "bg-[#0f3d2e] text-white" : "bg-white text-[#9a9a9a] ring-2 ring-[#e6e6e6]"
                                            } ${courante ? "ring-[6px] ring-[#e6f0eb]" : ""}`}
                                        >
                                            {faite && !courante ? (
                                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                                            ) : (
                                                i + 1
                                            )}
                                        </span>
                                        <span className={`mt-2 text-xs sm:text-sm font-medium ${faite ? "text-[#111]" : "text-[#9a9a9a]"}`}>{e.label}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* ===== Colonne principale ===== */}
                    <div className="lg:col-span-2 space-y-6">
                        <Carte
                            titre="Description"
                            icone={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>}
                        >
                            <p className="text-sm text-[#333] leading-relaxed whitespace-pre-line break-words">{demand.description}</p>
                        </Carte>

                        <Carte
                            titre="Commentaires"
                            icone={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>}
                            droite={<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e6f0eb] text-[#0f3d2e]">{comments.length}</span>}
                        >
                            {comments.length === 0 ? (
                                <div className="text-center py-8 rounded-xl bg-[#f6f6f6]">
                                    <p className="text-sm font-medium text-[#111]">Aucun commentaire pour l'instant</p>
                                    <p className="text-xs text-[#6b6b6b] mt-1">Sois le premier à donner une information sur cette demande.</p>
                                </div>
                            ) : (
                                <ol className="space-y-4">
                                    {comments.map((c: any, index: number) => {
                                        const auteur = `${c.author_first_name ?? ""} ${c.author_last_name ?? ""}`.trim() || "Utilisateur";
                                        return (
                                            <li key={index} className="flex gap-3">
                                                <span className="w-9 h-9 shrink-0 rounded-full bg-[#0f3d2e] text-white text-xs font-bold flex items-center justify-center">
                                                    {initiales(auteur)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">
                                                        <span className="font-semibold text-[#111]">{auteur}</span>
                                                        <span className="text-[#9a9a9a]"> · {dateLongue(c.created_at)} à {heure(c.created_at)}</span>
                                                    </p>
                                                    <p className="mt-1.5 inline-block max-w-full rounded-2xl rounded-tl-sm bg-[#f6f6f6] px-4 py-2.5 text-sm text-[#333] whitespace-pre-line break-words">
                                                        {c.content}
                                                    </p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}

                            {supprimee ? (
                                <p className="mt-6 text-sm text-[#6b6b6b]">Demande supprimée : les commentaires sont fermés.</p>
                            ) : peutModifier ? (
                                <CommentForm demandId={id} />
                            ) : (
                                <p className="mt-6 text-sm text-[#6b6b6b]">Ton rôle « Lecture seule » ne permet pas de commenter.</p>
                            )}
                        </Carte>
                    </div>

                    {/* ===== Colonne latérale ===== */}
                    <aside className="space-y-6">
                        <section className="bg-white rounded-2xl border border-[#e6e6e6] p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-[#111] mb-2">Détails</h2>
                            <dl className="divide-y divide-[#efefef]">
                                <Ligne libelle="Statut">
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statut.badge}`}>{statut.label}</span>
                                </Ligne>
                                <Ligne libelle="Priorité">
                                    <span className="inline-flex items-center gap-2">
                                        <span className="flex items-end gap-0.5 h-3" aria-hidden="true">
                                            {[1, 2, 3].map((n) => (
                                                <span key={n} className={`w-1 rounded-sm ${n <= priorite.niveau ? priorite.couleur : "bg-[#e6e6e6]"}`} style={{ height: `${n * 33}%` }} />
                                            ))}
                                        </span>
                                        {priorite.label}
                                    </span>
                                </Ligne>
                                <Ligne libelle="Catégorie">{demand.category}</Ligne>
                                <Ligne libelle="Créée le">{dateLongue(demand.created_at)}</Ligne>
                                {demand.updated_at && <Ligne libelle="Modifiée">{depuis(demand.updated_at)}</Ligne>}
                            </dl>
                        </section>

                        <section className="bg-white rounded-2xl border border-[#e6e6e6] p-5 sm:p-6">
                            <h2 className="text-base font-semibold text-[#111] mb-4">Agent assigné</h2>
                            {demand.agent_full_name ? (
                                <div className="flex items-center gap-3 rounded-xl bg-[#e6f0eb] p-3">
                                    <span className="w-11 h-11 rounded-full bg-[#0f3d2e] text-white text-sm font-bold flex items-center justify-center">
                                        {initiales(demand.agent_full_name)}
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold text-[#111]">{demand.agent_full_name}</p>
                                        <p className="text-xs text-[#0f3d2e]">Suit cette demande</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl bg-[#f6f6f6] p-4">
                                    <p className="text-sm font-medium text-[#111]">Aucun agent assigné</p>
                                    {peutAgir && <Link href={`/demands/${id}/edit`} className="inline-block mt-1 text-xs font-semibold text-[#0f3d2e] underline underline-offset-2 hover:text-[#111]">
                                        Assigner un agent →
                                    </Link>}
                                </div>
                            )}
                        </section>

                        {/* ===== Historique (journal d'activité de la demande) ===== */}
                        <section className="bg-white rounded-2xl border border-[#e6e6e6] p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold text-[#111]">Historique</h2>
                                {admin && <Link href="/journal" className="text-xs font-semibold text-[#0f3d2e] underline underline-offset-2 hover:text-[#111]">Journal complet</Link>}
                            </div>
                            {historique.length === 0 ? (
                                <p className="text-sm text-[#6b6b6b]">Aucune action enregistrée pour l&apos;instant.</p>
                            ) : (
                                <ol className="relative ml-1.5 border-l-2 border-[#efefef] space-y-5">
                                    {historique.map((h) => {
                                        const s = styleAction(h.action);
                                        return (
                                            <li key={h.id_activity_log} className="relative pl-5">
                                                <span className={`absolute -left-[7px] top-1 w-3 h-3 rounded-full ring-4 ring-white ${s.point}`} />
                                                <p className="text-sm text-[#111]">
                                                    <span className="font-semibold">{s.label}</span>
                                                    <span className="text-[#6b6b6b]"> · {h.actor_label}</span>
                                                </p>
                                                {h.action !== "CREATION" && detailAction(h) && (
                                                    <p className="text-xs text-[#555] mt-0.5 break-words">{detailAction(h)}</p>
                                                )}
                                                <p className="text-xs text-[#9a9a9a] mt-0.5" title={dateHeure(h.created_at)}>{ilYA(h.created_at)}</p>
                                            </li>
                                        );
                                    })}
                                </ol>
                            )}
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
