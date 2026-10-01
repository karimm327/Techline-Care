import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { estAdmin } from "@/lib/auth";
import { ACTIONS, countActivityByAction, countDeletedDemands, findActivity } from "@/lib/db/queries/activity.queries";
import { BadgeAction, dateHeure, detailAction, ilYA } from "@/components/activity/actions";
import RestoreButton from "@/components/activity/RestoreButton";

const PAR_PAGE = 20;

interface Props {
    searchParams: Promise<{ action?: string; page?: string }>;
}

const initiales = (nom: string) => nom.split(" ").filter(Boolean).map((m) => m[0]).join("").slice(0, 2).toUpperCase();
const reference = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

function lien(action: string | undefined, page = 1) {
    const p = new URLSearchParams();
    if (action) p.set("action", action);
    if (page > 1) p.set("page", String(page));
    const q = p.toString();
    return `/journal${q ? `?${q}` : ""}`;
}

/* Lien vers la demande + état « supprimée » */
function CelluleDemande({ id, titre, supprimee }: { id: string | null; titre: string | null; supprimee: boolean }) {
    if (!id) return <span className="text-slate-400">—</span>;
    return (
        <div className="min-w-0">
            <Link href={`/demands/${id}`} className={`block font-medium truncate transition ${supprimee ? "text-slate-500 line-through decoration-red-400 hover:text-red-700" : "text-slate-900 hover:text-blue-600"}`}>
                {titre ?? "Demande"}
            </Link>
            <span className="text-xs text-slate-400 font-mono">{reference(id)}</span>
            {supprimee && <span className="ml-2 text-[11px] font-semibold uppercase tracking-wide text-red-600">Supprimée</span>}
        </div>
    );
}

export default async function JournalPage({ searchParams }: Props) {
    const moi = await requireUser();
    if (!estAdmin(moi.role)) redirect("/demands"); // réservé aux administrateurs

    const { action: actionParam, page: pageParam } = await searchParams;
    const action = actionParam && (ACTIONS as readonly string[]).includes(actionParam) ? actionParam : undefined;
    const pageDemandee = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

    const [{ lignes, total }, parAction, supprimees] = await Promise.all([
        findActivity({ action, page: pageDemandee, parPage: PAR_PAGE }),
        countActivityByAction(),
        countDeletedDemands(),
    ]);

    const totalGeneral = Object.values(parAction).reduce((a, b) => a + b, 0);
    const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE));
    const page = Math.min(pageDemandee, totalPages);

    const filtres = [{ code: undefined as string | undefined, label: "Toutes", total: totalGeneral }, ...ACTIONS.map((a) => ({
        code: a as string | undefined,
        label: { CREATION: "Créations", MODIFICATION: "Modifications", SUPPRESSION: "Suppressions", RESTAURATION: "Restaurations", COMMENTAIRE: "Commentaires" }[a],
        total: parAction[a] ?? 0,
    }))];

    return (
        <div className="bg-slate-50 min-h-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* En-tête */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <span className="w-12 h-12 shrink-0 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                        </span>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Administration</p>
                            <h1 className="text-2xl font-semibold text-slate-900">Journal d&apos;activité</h1>
                            <p className="text-sm text-slate-500 mt-1">Qui a fait quoi, sur quelle demande et quand. Les suppressions y restent tracées.</p>
                        </div>
                    </div>
                    {supprimees > 0 && (
                        <Link href={lien("SUPPRESSION")} className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 transition">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {supprimees} demande{supprimees > 1 ? "s" : ""} supprimée{supprimees > 1 ? "s" : ""}
                        </Link>
                    )}
                </div>

                {/* Filtres */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {filtres.map((f) => {
                        const actif = f.code === action;
                        return (
                            <Link
                                key={f.label}
                                href={lien(f.code)}
                                className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium ring-1 transition ${actif ? "bg-slate-900 text-white ring-slate-900" : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300"}`}
                            >
                                {f.label}
                                <span className={`text-xs tabular-nums px-1.5 py-0.5 rounded-full ${actif ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>{f.total}</span>
                            </Link>
                        );
                    })}
                </div>

                <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-slate-200">
                        <h2 className="text-base font-semibold text-slate-900">Historique</h2>
                        {total > 0 && (
                            <p className="text-sm text-slate-500 tabular-nums">
                                {(page - 1) * PAR_PAGE + 1}–{Math.min(page * PAR_PAGE, total)} sur {total}
                            </p>
                        )}
                    </div>

                    {lignes.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm font-medium text-slate-800">Aucune activité</p>
                            <p className="text-sm text-slate-500 mt-1">Les actions apparaîtront ici dès qu&apos;une demande sera créée, modifiée, commentée ou supprimée.</p>
                        </div>
                    ) : (
                        <>
                            {/* Tableau (ordinateur) */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            <th className="px-4 py-3">Action</th>
                                            <th className="px-4 py-3">Utilisateur</th>
                                            <th className="px-4 py-3">Demande</th>
                                            <th className="px-4 py-3">Commentaire / détail</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {lignes.map((l) => (
                                            <tr key={l.id_activity_log} className="align-top hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3.5"><BadgeAction action={l.action} /></td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-2 text-slate-700 whitespace-nowrap">
                                                        <span className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center shrink-0">{initiales(l.actor_label)}</span>
                                                        {l.actor_label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 max-w-[240px]">
                                                    <CelluleDemande id={l.id_demand} titre={l.demand_title} supprimee={l.demand_deleted} />
                                                </td>
                                                <td className="px-4 py-3.5 min-w-[220px] max-w-sm text-slate-600 break-words">
                                                    {detailAction(l) ?? <span className="text-slate-400">—</span>}
                                                </td>
                                                <td className="px-4 py-3.5 whitespace-nowrap">
                                                    <span className="block text-slate-700">{ilYA(l.created_at)}</span>
                                                    <span className="text-xs text-slate-400 tabular-nums">{dateHeure(l.created_at)}</span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    {l.id_demand && (
                                                        <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                                                            <Link href={`/demands/${l.id_demand}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2">Consulter</Link>
                                                            {l.action === "SUPPRESSION" && l.demand_deleted && <RestoreButton id={l.id_demand} variante="lien" />}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cartes (mobile) */}
                            <ul className="md:hidden divide-y divide-slate-100">
                                {lignes.map((l) => (
                                    <li key={l.id_activity_log} className="p-4 space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <BadgeAction action={l.action} />
                                            <span className="text-xs text-slate-400" title={dateHeure(l.created_at)}>{ilYA(l.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-slate-700"><span className="font-medium text-slate-900">{l.actor_label}</span></p>
                                        <CelluleDemande id={l.id_demand} titre={l.demand_title} supprimee={l.demand_deleted} />
                                        {detailAction(l) && <p className="text-sm text-slate-600 break-words rounded-lg bg-slate-50 px-3 py-2">{detailAction(l)}</p>}
                                        {l.id_demand && (
                                            <div className="flex items-center gap-4 pt-1">
                                                <Link href={`/demands/${l.id_demand}`} className="text-xs font-semibold text-blue-600 underline underline-offset-2">Consulter</Link>
                                                {l.action === "SUPPRESSION" && l.demand_deleted && <RestoreButton id={l.id_demand} variante="lien" />}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50/60 text-sm">
                                    <p className="text-slate-500">Page {page} sur {totalPages}</p>
                                    <div className="flex gap-2">
                                        {page > 1 ? <Link href={lien(action, page - 1)} className="px-3 py-2 rounded-lg font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100">‹ Précédent</Link> : null}
                                        {page < totalPages ? <Link href={lien(action, page + 1)} className="px-3 py-2 rounded-lg font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100">Suivant ›</Link> : null}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </div>
    );
}
