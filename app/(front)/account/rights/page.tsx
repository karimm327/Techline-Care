"use client";

import { useEffect, useMemo, useState } from "react";

type Statut = "en_attente" | "en_cours" | "traitee" | "refusee";

type Demande = {
    id: string;
    titre: string;
    demandeur?: string;
    statut: Statut;
    dateCreation: string;
    dateTraitement?: string;
};

const statutConfig: Record<Statut, { label: string; badge: string; dot: string }> = {
    en_attente: { label: "En attente", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
    en_cours: { label: "En cours", badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    traitee: { label: "Traitée", badge: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
    refusee: { label: "Refusée", badge: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const filters: { key: "toutes" | Statut; label: string }[] = [
    { key: "toutes", label: "Toutes" },
    { key: "traitee", label: "Traitées" },
    { key: "en_cours", label: "En cours" },
    { key: "en_attente", label: "En attente" },
    { key: "refusee", label: "Refusées" },
];

export default function RightsPage() {
    const [demandes, setDemandes] = useState<Demande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<"toutes" | Statut>("toutes");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDemandes = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/demands");
                if (!res.ok) throw new Error("Erreur lors du chargement");
                const data = await res.json();
                setDemandes(data.demandes ?? data);
            } catch {
                setError("Impossible de charger l'historique des demandes.");
            } finally {
                setLoading(false);
            }
        };

        fetchDemandes();
    }, []);

    const stats = useMemo(() => {
        return {
            total: demandes.length,
            traitees: demandes.filter((d) => d.statut === "traitee").length,
            enCours: demandes.filter((d) => d.statut === "en_cours").length,
            enAttente: demandes.filter((d) => d.statut === "en_attente").length,
            refusees: demandes.filter((d) => d.statut === "refusee").length,
        };
    }, [demandes]);

    const filtered = useMemo(() => {
        return demandes
            .filter((d) => activeFilter === "toutes" || d.statut === activeFilter)
            .filter((d) => d.titre.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
    }, [demandes, activeFilter, search]);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                {/* En-tête */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Historique des demandes</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Retrouvez l&apos;ensemble des demandes que vous avez traitées
                    </p>
                </div>

                {/* Cartes stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Traitées</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{stats.traitees}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">En cours</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.enCours}</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.enAttente}</p>
                    </div>
                </div>

                {/* Barre de filtres + recherche */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex flex-wrap gap-2">
                        {filters.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeFilter === f.key
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une demande..."
                        className="w-full sm:w-64 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black bg-white"
                    />
                </div>

                {/* Contenu */}
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                        <p className="text-sm text-gray-500">Chargement de l&apos;historique...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <p className="text-sm text-gray-500">Aucune demande ne correspond à ces critères.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        {/* En-tête de tableau (desktop uniquement) */}
                        <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <div className="col-span-5">Demande</div>
                            <div className="col-span-2">Statut</div>
                            <div className="col-span-2">Créée le</div>
                            <div className="col-span-2">Traitée le</div>
                            <div className="col-span-1">Réf.</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filtered.map((d) => {
                                const cfg = statutConfig[d.statut];
                                return (
                                    <div
                                        key={d.id}
                                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-5 py-4 hover:bg-gray-50 transition"
                                    >
                                        <div className="sm:col-span-5">
                                            <p className="text-sm font-medium text-gray-900">{d.titre}</p>
                                            {d.demandeur && (
                                                <p className="text-xs text-gray-400 mt-0.5">Par {d.demandeur}</p>
                                            )}
                                        </div>

                                        <div className="sm:col-span-2 flex items-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badge}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <div className="sm:col-span-2 flex items-center text-xs text-gray-500">
                                            {formatDate(d.dateCreation)}
                                        </div>

                                        <div className="sm:col-span-2 flex items-center text-xs text-gray-500">
                                            {formatDate(d.dateTraitement)}
                                        </div>

                                        <div className="sm:col-span-1 flex items-center text-xs text-gray-400 font-mono">
                                            #{d.id.slice(0, 6)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}