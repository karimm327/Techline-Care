import { cn } from "@/lib/ui/cn";
import { dateHeure, ilYA } from "@/lib/ui/format";

/* Apparence de chaque action du journal (badge, pastille, icône), partagée par le journal,
   le tableau de bord et la fiche demande. Couleurs : tokens Ardoise uniquement. */
type StyleAction = {
  label: string;
  // Verbe pour les phrases « Lucas Petit a commenté … »
  verbe: string;
  badge: string;
  point: string;
  pastille: string;
  lettre: string;
  icone: React.ReactNode;
};

export const ACTIONS_JOURNAL: Record<string, StyleAction> = {
  CREATION: {
    label: "Création",
    verbe: "a créé",
    badge: "text-st-nouvelle-fg bg-st-nouvelle/15 ring-st-nouvelle/35",
    point: "bg-st-nouvelle",
    pastille: "text-st-nouvelle-fg bg-st-nouvelle/15",
    lettre: "C",
    icone: <path d="M12 5v14M5 12h14" />,
  },
  MODIFICATION: {
    label: "Modification",
    verbe: "a modifié",
    badge: "text-st-encours-fg bg-st-encours/15 ring-st-encours/35",
    point: "bg-st-encours",
    pastille: "text-st-encours-fg bg-st-encours/15",
    lettre: "M",
    icone: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  },
  SUPPRESSION: {
    label: "Suppression",
    verbe: "a supprimé",
    badge: "text-danger-fg bg-danger/15 ring-danger/35",
    point: "bg-danger",
    pastille: "text-danger-fg bg-danger/15",
    lettre: "×",
    icone: <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  },
  RESTAURATION: {
    label: "Restauration",
    verbe: "a restauré",
    badge: "text-success-fg bg-success/15 ring-success/35",
    point: "bg-success",
    pastille: "text-success-fg bg-success/15",
    lettre: "R",
    icone: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />,
  },
  COMMENTAIRE: {
    label: "Commentaire",
    verbe: "a commenté",
    badge: "text-accent-fg-2 bg-accent/20 ring-accent/40",
    point: "bg-accent-soft",
    pastille: "text-accent-fg-2 bg-accent/20",
    lettre: "K",
    icone: (
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    ),
  },
  PIECE_JOINTE: {
    label: "Pièce jointe",
    verbe: "a joint un fichier à",
    badge: "text-fg-1 bg-surface-3 ring-line-strong",
    point: "bg-fg-3",
    pastille: "text-fg-1 bg-surface-3",
    lettre: "P",
    icone: (
      <path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
    ),
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

export function styleAction(action: string): StyleAction {
  return (
    ACTIONS_JOURNAL[action] ?? {
      label: "Autre",
      verbe: "a agi sur",
      badge: "text-fg-2 bg-fg-2/10 ring-fg-2/30",
      point: "bg-fg-4",
      pastille: "text-fg-2 bg-fg-2/10",
      lettre: "·",
      icone: <circle cx="12" cy="12" r="3" />,
    }
  );
}

export function BadgeAction({
  action,
  className,
}: {
  action: string;
  className?: string;
}) {
  const s = styleAction(action);
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset",
        s.badge,
        className,
      )}
    >
      <svg
        aria-hidden="true"
        className="size-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {s.icone}
      </svg>
      {s.label}
    </span>
  );
}

export { dateHeure, ilYA };
