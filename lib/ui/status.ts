// Données de présentation centralisées : statuts, priorités, couleurs d'avatar.
// Les classes sont écrites en entier pour que Tailwind les détecte.

export const STATUTS = {
  NOUVELLE: {
    label: "Nouvelle",
    point: "bg-st-nouvelle",
    badge: "text-st-nouvelle-fg bg-st-nouvelle/15 ring-st-nouvelle/35",
    touche: "1",
  },
  EN_COURS: {
    label: "En cours",
    point: "bg-st-encours",
    badge: "text-st-encours-fg bg-st-encours/15 ring-st-encours/35",
    touche: "2",
  },
  CLOTUREE: {
    label: "Clôturée",
    point: "bg-st-cloturee",
    badge: "text-st-cloturee-fg bg-st-cloturee/15 ring-st-cloturee/35",
    touche: "3",
  },
  ANNULEE: {
    label: "Annulée",
    point: "bg-st-annulee",
    badge: "text-st-annulee-fg bg-st-annulee/15 ring-st-annulee/35",
    touche: "4",
  },
} as const;

export const PRIORITES = {
  HAUTE: { label: "Haute", niveau: 3, barre: "bg-prio-haute" },
  NORMALE: { label: "Normale", niveau: 2, barre: "bg-prio-normale" },
  BASSE: { label: "Basse", niveau: 1, barre: "bg-prio-basse" },
} as const;

export type CodeStatut = keyof typeof STATUTS;
export type CodePriorite = keyof typeof PRIORITES;

// Barre de priorité non remplie
export const BARRE_VIDE = "bg-line-field";

export function estCodeStatut(valeur: unknown): valeur is CodeStatut {
  return typeof valeur === "string" && valeur in STATUTS;
}

export function estCodePriorite(valeur: unknown): valeur is CodePriorite {
  return typeof valeur === "string" && valeur in PRIORITES;
}

// Libellé lisible, avec repli sur le code brut pour une valeur inconnue
export function libelleStatut(code: string): string {
  return estCodeStatut(code) ? STATUTS[code].label : code;
}

export function libellePriorite(code: string): string {
  return estCodePriorite(code) ? PRIORITES[code].label : code;
}

const COULEURS_AVATAR = [
  "bg-avatar-1",
  "bg-avatar-2",
  "bg-avatar-3",
  "bg-avatar-4",
  "bg-avatar-5",
  "bg-avatar-6",
  "bg-avatar-7",
  "bg-avatar-8",
] as const;

// Couleur stable par personne : hash simple de l'identifiant, modulo 8
export function avatarColor(id: string): (typeof COULEURS_AVATAR)[number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return COULEURS_AVATAR[Math.abs(hash) % COULEURS_AVATAR.length];
}

// « Alice Martin » → « AM »
export function initiales(nom: string): string {
  return (
    nom
      .split(/\s+/)
      .filter(Boolean)
      .map((mot) => mot[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}
