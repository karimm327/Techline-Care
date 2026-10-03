// Requête d'une vue enregistrée : seuls les filtres du tableau de bord, triés
// (« ?q=x&statut=A » et « ?statut=A&q=x » désignent la même vue).
export const CLES_VUE = [
  "statut",
  "priorite",
  "categorie",
  "agent",
  "sla",
  "q",
  "mode",
] as const;

export function normaliserRequete(requete: string): string {
  const source = new URLSearchParams(requete.replace(/^\?/, ""));
  const cible = new URLSearchParams();
  for (const cle of CLES_VUE) {
    const valeur = source.get(cle)?.trim();
    if (!valeur) continue;
    // Listes « A,B » triées pour comparer sans tenir compte de l'ordre
    const propre =
      cle === "q"
        ? valeur.slice(0, 100)
        : valeur.split(",").filter(Boolean).sort().join(",");
    if (propre) cible.set(cle, propre);
  }
  return cible.toString();
}

// Classes des pastilles de couleur (écrites en entier pour Tailwind)
export const PASTILLES_VUE: Record<string, string> = {
  accent: "bg-accent-soft",
  nouvelle: "bg-st-nouvelle",
  encours: "bg-st-encours",
  cloturee: "bg-st-cloturee",
  haute: "bg-prio-haute",
  annulee: "bg-st-annulee",
};

// Proposées tant que l'utilisateur n'a enregistré aucune vue
export const VUES_SUGGEREES = [
  {
    name: "Urgentes non assignées",
    color: "haute",
    query: "agent=aucun&priorite=HAUTE",
  },
  { name: "SLA bientôt dépassé", color: "encours", query: "sla=late,warn" },
];
