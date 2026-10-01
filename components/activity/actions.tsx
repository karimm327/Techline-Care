/* Apparence de chaque action du journal (badge + icône), partagée par le journal, le tableau de bord et la page détail */
export const ACTIONS_JOURNAL: Record<string, { label: string; badge: string; point: string; icone: React.ReactNode }> = {
    CREATION: {
        label: "Création",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        point: "bg-emerald-500",
        icone: <path d="M12 5v14M5 12h14" />,
    },
    MODIFICATION: {
        label: "Modification",
        badge: "bg-blue-50 text-blue-700 ring-blue-200",
        point: "bg-blue-500",
        icone: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
    },
    SUPPRESSION: {
        label: "Suppression",
        badge: "bg-red-50 text-red-700 ring-red-200",
        point: "bg-red-500",
        icone: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
    },
    RESTAURATION: {
        label: "Restauration",
        badge: "bg-amber-50 text-amber-800 ring-amber-200",
        point: "bg-amber-500",
        icone: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
    },
    COMMENTAIRE: {
        label: "Commentaire",
        badge: "bg-violet-50 text-violet-700 ring-violet-200",
        point: "bg-violet-500",
        icone: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    },
};

// Anciennes lignes du journal (texte libre, ex. données de démonstration) : classées « Autre »
export const estActionConnue = (action: string) => action in ACTIONS_JOURNAL;

/* Texte à afficher dans la colonne « Commentaire / détail » */
export function detailAction(l: { action: string; details: string | null }) {
    if (!estActionConnue(l.action)) return l.action;
    if (l.action === "SUPPRESSION" && l.details) return `Motif : ${l.details}`;
    return l.details;
}

export function styleAction(action: string) {
    return ACTIONS_JOURNAL[action] ?? { label: "Autre", badge: "bg-slate-50 text-slate-700 ring-slate-200", point: "bg-slate-400", icone: <circle cx="12" cy="12" r="3" /> };
}

export function BadgeAction({ action }: { action: string }) {
    const s = styleAction(action);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 whitespace-nowrap ${s.badge}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{s.icone}</svg>
            {s.label}
        </span>
    );
}

export const dateHeure = (d: string) =>
    new Date(d).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function ilYA(d: string) {
    const min = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (min < 1) return "à l'instant";
    if (min < 60) return `il y a ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `il y a ${h} h`;
    const j = Math.floor(h / 24);
    if (j === 1) return "hier";
    if (j < 30) return `il y a ${j} jours`;
    return dateHeure(d).split(" ")[0];
}
