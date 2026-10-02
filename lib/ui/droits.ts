// Matrice des droits par rôle : reflète exactement les contrôles faits par l'API
// (exigerConnexion, estAdmin). À mettre à jour si une règle change.
export const ROLES_MATRICE = ["ADMIN", "AGENT", "LECTURE"] as const;
export type RoleMatrice = (typeof ROLES_MATRICE)[number];

export const LIBELLES_ROLES: Record<RoleMatrice, string> = {
  ADMIN: "Administrateur",
  AGENT: "Agent",
  LECTURE: "Lecture seule",
};

export const DESCRIPTIONS_ROLES: Record<RoleMatrice, string> = {
  ADMIN: "Accès complet, journal d’activité et restauration.",
  AGENT: "Crée, modifie et commente les demandes.",
  LECTURE: "Consulte les demandes sans les modifier.",
};

export const DROITS: { action: string; roles: RoleMatrice[] }[] = [
  { action: "Consulter les demandes", roles: ["ADMIN", "AGENT", "LECTURE"] },
  { action: "Créer une demande", roles: ["ADMIN", "AGENT"] },
  { action: "Modifier une demande", roles: ["ADMIN", "AGENT"] },
  { action: "Changer le statut", roles: ["ADMIN", "AGENT"] },
  { action: "Assigner un agent", roles: ["ADMIN", "AGENT"] },
  { action: "Commenter une demande", roles: ["ADMIN", "AGENT"] },
  { action: "Supprimer une demande (avec motif)", roles: ["ADMIN", "AGENT"] },
  { action: "Consulter le journal d’activité", roles: ["ADMIN"] },
  { action: "Restaurer une demande supprimée", roles: ["ADMIN"] },
];
