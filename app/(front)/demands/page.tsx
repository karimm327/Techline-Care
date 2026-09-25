import Link from "next/link";
import { findAllDemands } from "@/lib/db/queries/demand.queries";
import SortableHeader from "@/components/SortableHeader";

const STATUS_STYLES: Record<string, string> = {
    NOUVELLE: "bg-gray-100 text-gray-700",
    EN_COURS: "bg-blue-100 text-blue-700",
    CLOTUREE: "bg-teal-100 text-teal-700",
    ANNULEE: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
    NOUVELLE: "Nouvelle",
    EN_COURS: "En cours",
    CLOTUREE: "Clôturée",
    ANNULEE: "Annulée",
};

const PRIORITY_STYLES: Record<string, string> = {
    BASSE: "bg-gray-100 text-gray-600",
    NORMALE: "bg-amber-100 text-amber-700",
    HAUTE: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<string, string> = {
    BASSE: "Basse",
    NORMALE: "Normale",
    HAUTE: "Haute",
};

interface Props {
    searchParams: Promise<{ sortBy?: string; sortOrder?: string }>;
}

function Badge({ label, className }: { label: string; className: string }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
    );
}

function NewDemandButton() {
    return (
        <Link href="/demands/new">
            <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nouvelle demande
            </button>
        </Link>
    );
}

export default async function DemandsPage({ searchParams }: Props) {
    const { sortBy = "created_at", sortOrder = "DESC" } = await searchParams;

    try {
        const demands = await findAllDemands(sortBy, sortOrder);

        if (!demands || demands.length === 0) {
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
                        <NewDemandButton />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm py-20 px-6 flex flex-col items-center text-center">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-800">Aucune demande</h2>
                        <p className="text-sm text-gray-500 mt-1 mb-6 max-w-sm">
                            Créez votre première demande pour commencer à suivre son traitement.
                        </p>
                        <NewDemandButton />
                    </div>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Demandes</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {demands.length} demande{demands.length > 1 ? "s" : ""} au total
                        </p>
                    </div>
                    <NewDemandButton />
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <SortableHeader label="Titre" field="title" />
                                <SortableHeader label="Date de création" field="created_at" />
                                <SortableHeader label="Statut" field="status" />
                                <SortableHeader label="Priorité" field="priority" />
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Catégorie
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Agent assigné
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                            {demands.map((d) => (
                                <tr key={d.id_demand} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-medium">
                                        <Link href={`/demands/${d.id_demand}`} className="text-gray-900 hover:text-blue-600 transition">
                                            {d.title}
                                        </Link>
                                    </td>

                                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                        {new Date(d.created_at).toLocaleDateString("fr-FR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                    </td>

                                    <td className="px-4 py-3">
                                        <Badge
                                            label={STATUS_LABELS[d.status] ?? d.status}
                                            className={STATUS_STYLES[d.status] ?? "bg-gray-100 text-gray-700"}
                                        />
                                    </td>

                                    <td className="px-4 py-3">
                                        <Badge
                                            label={PRIORITY_LABELS[d.priority] ?? d.priority}
                                            className={PRIORITY_STYLES[d.priority] ?? "bg-gray-100 text-gray-700"}
                                        />
                                    </td>

                                    <td className="px-4 py-3 text-gray-600">{d.category}</td>

                                    <td className="px-4 py-3">
                                        {d.agent_full_name ? (
                                            <span className="text-gray-700">{d.agent_full_name}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Non assigné</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/demands/${d.id_demand}/edit`}
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition text-sm font-medium"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                            Modifier
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error(error);
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Demandes</h1>
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                    Erreur lors du chargement des demandes.
                </div>
            </div>
        );
    }
}