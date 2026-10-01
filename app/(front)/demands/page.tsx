import Link from "next/link";
import { findAllDemands } from "@/lib/db/queries/demand.queries";
import SortableHeader from "@/components/SortableHeader";
import { requireUser } from "@/lib/auth/session";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { findRecentActivity, type LigneJournal } from "@/lib/db/queries/activity.queries";
import { ilYA, dateHeure, styleAction, detailAction } from "@/components/activity/actions";

const PAR_PAGE = 10;

const STATUTS: Record<string, { label: string; badge: string; point: string }> = {
    NOUVELLE: { label: "Nouvelle", badge: "bg-slate-100 text-slate-700 ring-slate-200", point: "bg-slate-400" },
    EN_COURS: { label: "En cours", badge: "bg-blue-50 text-blue-700 ring-blue-200", point: "bg-blue-500" },
    CLOTUREE: { label: "Clôturée", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", point: "bg-emerald-500" },
    ANNULEE: { label: "Annulée", badge: "bg-red-50 text-red-700 ring-red-200", point: "bg-red-500" },
};

const PRIORITES: Record<string, { label: string; niveau: number; couleur: string }> = {
    BASSE: { label: "Basse", niveau: 1, couleur: "bg-slate-400" },
    NORMALE: { label: "Normale", niveau: 2, couleur: "bg-amber-500" },
    HAUTE: { label: "Haute", niveau: 3, couleur: "bg-red-500" },
};

interface Props {
    searchParams: Promise<{ sortBy?: string; sortOrder?: string; page?: string; supprimee?: string }>;
}

type Demande = {
    id_demand: string;
    title: string;
    created_at: string;
    status: string;
    priority: string;
    category: string;
    agent_full_name: string | null;
};

/* ---------- Petits composants ---------- */

function Statut({ code }: { code: string }) {
    const s = STATUTS[code] ?? { label: code, badge: "bg-slate-100 text-slate-700 ring-slate-200", point: "bg-slate-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ring-1 ring-inset ${s.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.point}`} />
            {s.label}
        </span>
    );
}

function Priorite({ code }: { code: string }) {
    const p = PRIORITES[code] ?? { label: code, niveau: 0, couleur: "bg-slate-400" };
    return (
        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span className="flex items-end gap-0.5 h-3.5" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                    <span key={n} className={`w-1 rounded-sm ${n <= p.niveau ? p.couleur : "bg-slate-200"}`} style={{ height: `${n * 33}%` }} />
                ))}
            </span>
            {p.label}
        </span>
    );
}

function Agent({ nom }: { nom: string | null }) {
    if (!nom) return <span className="text-sm text-slate-400 italic">Non assigné</span>;
    const initiales = nom.split(" ").map((m) => m[0]).join("").slice(0, 2).toUpperCase();
    return (
        <span className="inline-flex items-center gap-2 text-sm text-slate-700">
            <span className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">{initiales}</span>
            <span className="truncate">{nom}</span>
        </span>
    );
}

const dateFr = (d: string) =>
    new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

const reference = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

function BoutonNouvelle() {
    return (
        <Link
            href="/demands/new"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition shadow-sm"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle demande
        </Link>
    );
}

function CarteStat({ titre, valeur, detail, couleur }: { titre: string; valeur: number; detail: string; couleur: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{titre}</p>
                <span className={`w-2.5 h-2.5 rounded-full ${couleur}`} />
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-900 tabular-nums">{valeur}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
    );
}

function Pagination({ page, totalPages, sortBy, sortOrder }: { page: number; totalPages: number; sortBy: string; sortOrder: string }) {
    if (totalPages <= 1) return null;
    const lien = (p: number) => `/demands?sortBy=${sortBy}&sortOrder=${sortOrder}&page=${p}`;

    // Numéros affichés : 1 … (page-1) page (page+1) … dernière
    const numeros: (number | "…")[] = [];
    for (let p = 1; p <= totalPages; p++) {
        if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) numeros.push(p);
        else if (numeros[numeros.length - 1] !== "…") numeros.push("…");
    }

    const base = "inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-lg text-sm font-medium transition";
    return (
        <nav className="flex items-center gap-1" aria-label="Pagination">
            {page > 1 ? (
                <Link href={lien(page - 1)} className={`${base} text-slate-700 hover:bg-slate-100`} aria-label="Page précédente">‹ <span className="hidden sm:inline ml-1">Précédent</span></Link>
            ) : (
                <span className={`${base} text-slate-300 cursor-not-allowed`}>‹ <span className="hidden sm:inline ml-1">Précédent</span></span>
            )}

            {numeros.map((n, i) =>
                n === "…" ? (
                    <span key={`e${i}`} className="px-1 text-slate-400">…</span>
                ) : (
                    <Link
                        key={n}
                        href={lien(n)}
                        aria-current={n === page ? "page" : undefined}
                        className={`${base} ${n === page ? "bg-blue-600 text-white shadow-sm" : "text-slate-700 hover:bg-slate-100"}`}
                    >
                        {n}
                    </Link>
                )
            )}

            {page < totalPages ? (
                <Link href={lien(page + 1)} className={`${base} text-slate-700 hover:bg-slate-100`} aria-label="Page suivante"><span className="hidden sm:inline mr-1">Suivant</span> ›</Link>
            ) : (
                <span className={`${base} text-slate-300 cursor-not-allowed`}><span className="hidden sm:inline mr-1">Suivant</span> ›</span>
            )}
        </nav>
    );
}

/* Encart « Activité récente » (administrateurs) */
function ActiviteRecente({ lignes }: { lignes: LigneJournal[] }) {
    return (
        <section className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h4l3 8 4-16 3 8h4" /></svg>
                    </span>
                    <h2 className="text-base font-semibold text-slate-900">Activité récente</h2>
                </div>
                <Link href="/journal" className="text-sm font-medium text-blue-600 hover:text-blue-800">Journal complet →</Link>
            </div>
            {lignes.length === 0 ? (
                <p className="px-5 py-8 text-sm text-slate-500 text-center">Aucune activité enregistrée pour l&apos;instant.</p>
            ) : (
                <ul className="divide-y divide-slate-100">
                    {lignes.map((l) => {
                        const s = styleAction(l.action);
                        return (
                            <li key={l.id_activity_log} className="flex items-start gap-3 px-5 py-3.5">
                                <span className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${s.point}`} />
                                <div className="flex-1 min-w-0 text-sm">
                                    <p className="text-slate-700">
                                        <span className="font-medium text-slate-900">{l.actor_label}</span>
                                        <span className="text-slate-500"> · {s.label.toLowerCase()}</span>
                                        {l.id_demand && (
                                            <>
                                                <span className="text-slate-500"> · </span>
                                                <Link href={`/demands/${l.id_demand}`} className={`font-medium hover:text-blue-600 ${l.demand_deleted ? "line-through decoration-red-400 text-slate-500" : "text-slate-900"}`}>
                                                    {l.demand_title}
                                                </Link>
                                            </>
                                        )}
                                    </p>
                                    {l.action !== "CREATION" && detailAction(l) && <p className="text-xs text-slate-500 mt-0.5 truncate">{detailAction(l)}</p>}
                                </div>
                                <span className="text-xs text-slate-400 whitespace-nowrap" title={dateHeure(l.created_at)}>{ilYA(l.created_at)}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

/* ---------- Page ---------- */

export default async function DemandsPage({ searchParams }: Props) {
    const moi = await requireUser(); // page réservée aux utilisateurs connectés
    const peutModifier = !estLectureSeule(moi.role);
    const admin = estAdmin(moi.role);
    const { sortBy = "created_at", sortOrder = "DESC", page: pageParam, supprimee } = await searchParams;

    let demandes: Demande[];
    try {
        demandes = await findAllDemands(sortBy, sortOrder);
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-semibold text-slate-900 mb-4">Tableau de bord</h1>
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                    Erreur lors du chargement des demandes.
                </div>
            </div>
        );
    }

    // Dernières actions du journal (administrateurs seulement)
    const activite = admin ? await findRecentActivity(6).catch(() => []) : [];

    const total = demandes.length;
    const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));
    const page = Math.min(Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1), totalPages);
    const debut = (page - 1) * PAR_PAGE;
    const affichees = demandes.slice(debut, debut + PAR_PAGE);

    const compter = (code: string) => demandes.filter((d) => d.status === code).length;
    const nonAssignees = demandes.filter((d) => !d.agent_full_name).length;

    return (
        <div className="bg-slate-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Pilotage</p>
                        <h1 className="text-2xl font-semibold text-slate-900">Tableau de bord des demandes</h1>
                        <p className="text-sm text-slate-500 mt-1">Suivez, priorisez et assignez les demandes de support.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {admin && (
                            <Link href="/journal" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100 transition">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                                Journal d&apos;activité
                            </Link>
                        )}
                        {peutModifier && <BoutonNouvelle />}
                    </div>
                </div>

                {/* Confirmation après une suppression */}
                {supprimee === "1" && (
                    <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
                        <p>
                            La demande a été supprimée. Le motif est enregistré dans le journal d&apos;activité
                            {admin ? <> — <Link href="/journal?action=SUPPRESSION" className="font-semibold underline underline-offset-2">consulter / restaurer</Link>.</> : " ; un administrateur peut la restaurer."}
                        </p>
                    </div>
                )}

                {/* Indicateurs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <CarteStat titre="Total" valeur={total} detail={`${nonAssignees} non assignée${nonAssignees > 1 ? "s" : ""}`} couleur="bg-slate-900" />
                    <CarteStat titre="Nouvelles" valeur={compter("NOUVELLE")} detail="À prendre en charge" couleur="bg-slate-400" />
                    <CarteStat titre="En cours" valeur={compter("EN_COURS")} detail="En traitement" couleur="bg-blue-500" />
                    <CarteStat titre="Clôturées" valeur={compter("CLOTUREE")} detail="Terminées" couleur="bg-emerald-500" />
                </div>

                {/* Liste */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Toutes les demandes</h2>
                        {total > 0 && (
                            <p className="text-sm text-slate-500 tabular-nums">
                                {debut + 1}–{Math.min(debut + PAR_PAGE, total)} sur {total}
                            </p>
                        )}
                    </div>

                    {total === 0 ? (
                        <div className="py-20 px-6 flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800">Aucune demande</h3>
                            <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm">Créez votre première demande pour commencer à suivre son traitement.</p>
                            {peutModifier && <BoutonNouvelle />}
                        </div>
                    ) : (
                        <>
                            {/* Tableau (tablette et ordinateur) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <SortableHeader label="Demande" field="title" />
                                            <SortableHeader label="Créée le" field="created_at" />
                                            <SortableHeader label="Statut" field="status" />
                                            <SortableHeader label="Priorité" field="priority" />
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Catégorie</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Agent</th>
                                            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {affichees.map((d) => (
                                            <tr key={d.id_demand} className="group hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5 max-w-xs">
                                                    <Link href={`/demands/${d.id_demand}`} className="block font-medium text-slate-900 group-hover:text-blue-600 transition truncate">
                                                        {d.title}
                                                    </Link>
                                                    <span className="text-xs text-slate-400 font-mono">{reference(d.id_demand)}</span>
                                                </td>
                                                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{dateFr(d.created_at)}</td>
                                                <td className="px-4 py-3.5"><Statut code={d.status} /></td>
                                                <td className="px-4 py-3.5"><Priorite code={d.priority} /></td>
                                                <td className="px-4 py-3.5 text-slate-600">{d.category}</td>
                                                <td className="px-4 py-3.5 max-w-[200px]"><Agent nom={d.agent_full_name} /></td>
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link href={`/demands/${d.id_demand}`} title="Voir" className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                                            <span className="sr-only">Voir</span>
                                                        </Link>
                                                        {peutModifier && <Link href={`/demands/${d.id_demand}/edit`} title="Modifier" className="p-2 rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                            <span className="sr-only">Modifier</span>
                                                        </Link>}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cartes (mobile) */}
                            <ul className="md:hidden divide-y divide-slate-100">
                                {affichees.map((d) => (
                                    <li key={d.id_demand} className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <Link href={`/demands/${d.id_demand}`} className="min-w-0">
                                                <p className="font-medium text-slate-900 truncate">{d.title}</p>
                                                <p className="text-xs text-slate-400 font-mono mt-0.5">{reference(d.id_demand)} · {dateFr(d.created_at)}</p>
                                            </Link>
                                            <Statut code={d.status} />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <Priorite code={d.priority} />
                                            <span className="text-sm text-slate-500">{d.category}</span>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <Agent nom={d.agent_full_name} />
                                            {peutModifier && <Link href={`/demands/${d.id_demand}/edit`} className="text-sm font-medium text-blue-600 hover:text-blue-800 shrink-0">Modifier</Link>}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/60">
                                    <p className="text-sm text-slate-500">Page {page} sur {totalPages}</p>
                                    <Pagination page={page} totalPages={totalPages} sortBy={sortBy} sortOrder={sortOrder} />
                                </div>
                            )}
                        </>
                    )}
                </section>

                {admin && <ActiviteRecente lignes={activite} />}
            </div>
        </div>
    );
}
