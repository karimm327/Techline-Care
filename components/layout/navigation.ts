import { reference } from "@/lib/ui/format";

// Données de navigation partagées par la sidebar, le tiroir mobile et le fil d'Ariane.
// Les entrées des fonctionnalités pas encore livrées (Kanban, Statistiques, Mes demandes,
// vues enregistrées, équipe) sont ajoutées à leur étape de la refonte.

export type IconeNav = "tableau" | "kanban" | "stats" | "journal";

export type LienNav = {
  label: string;
  href: string;
  icone: IconeNav;
  // Masqué pour le rôle LECTURE
  pasLecture?: boolean;
  // Pastille à droite (ex. « NOUVEAU »)
  badge?: string;
};

export type SectionNav = {
  titre: string;
  liens: LienNav[];
  // Section visible seulement pour les administrateurs
  adminSeulement?: boolean;
};

export const SECTIONS_NAV: SectionNav[] = [
  {
    titre: "Pilotage",
    liens: [
      { label: "Tableau de bord", href: "/demands", icone: "tableau" },
      { label: "Kanban", href: "/demands?mode=kanban", icone: "kanban" },
      {
        label: "Statistiques",
        href: "/stats",
        icone: "stats",
        pasLecture: true,
        badge: "NOUVEAU",
      },
    ],
  },
  {
    titre: "Administration",
    adminSeulement: true,
    liens: [
      { label: "Journal d’activité", href: "/journal", icone: "journal" },
    ],
  },
];

// Lien actif : /demands couvre aussi les fiches et l'édition, mais pas la création
// Le tableau de bord en mode Kanban (?mode=kanban) active l'entrée « Kanban ».
export function estActif(
  href: string,
  chemin: string,
  mode?: string | null,
): boolean {
  if (href === "/demands?mode=kanban") {
    return chemin === "/demands" && mode === "kanban";
  }
  if (href === "/demands") {
    if (chemin === "/demands") return mode !== "kanban";
    return /^\/demands\/(?!new(\/|$))/.test(chemin);
  }
  return chemin === href || chemin.startsWith(`${href}/`);
}

export type Miette = { label: string; href?: string };

// Fil d'Ariane construit depuis le chemin courant
export function miettesPour(chemin: string): Miette[] {
  const tableau: Miette = { label: "Tableau de bord", href: "/demands" };
  const segments = chemin.split("/").filter(Boolean);

  if (segments[0] === "demands") {
    if (segments.length === 1)
      return [{ label: "Pilotage" }, { label: "Tableau de bord" }];
    if (segments[1] === "new")
      return [{ label: "Pilotage" }, tableau, { label: "Nouvelle demande" }];
    const ref = reference(decodeURIComponent(segments[1]));
    if (segments[2] === "edit")
      return [
        { label: "Pilotage" },
        tableau,
        { label: ref, href: `/demands/${segments[1]}` },
        { label: "Modifier" },
      ];
    return [{ label: "Pilotage" }, tableau, { label: `Demande ${ref}` }];
  }
  if (segments[0] === "stats")
    return [{ label: "Pilotage" }, { label: "Statistiques" }];
  if (segments[0] === "journal")
    return [{ label: "Administration" }, { label: "Journal d’activité" }];
  if (segments[0] === "account") {
    if (segments[1] === "rights")
      return [
        { label: "Mon espace" },
        { label: "Mon compte", href: "/account" },
        { label: "Mes droits" },
      ];
    return [{ label: "Mon espace" }, { label: "Mon compte" }];
  }
  return [];
}

export const LIBELLES_ROLE: Record<string, string> = {
  ADMIN: "Administrateur",
  AGENT: "Agent",
  LECTURE: "Lecture seule",
};
