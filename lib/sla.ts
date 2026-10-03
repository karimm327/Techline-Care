// État SLA d'une demande (F4, docs/refonte/06-features.md). Fonctions pures, sans dépendance :
// testées par lib/sla.test.mjs (npm test).

export type EtatSla = "late" | "warn" | "ok" | "done";

export type Sla = {
  etat: EtatSla;
  // « Dépassé · 25 min », « 1 h 40 », « 1 j 4 h », « Respecté », « Hors délai · 2 h »
  libelle: string;
  // Part du délai restant, de 1 (tout le délai) à 0 (échéance atteinte)
  ratioRestant: number;
};

type Entree = {
  statut: string;
  createdAt: string | Date;
  dueAt: string | Date | null;
  closedAt?: string | Date | null;
  maintenant?: number;
};

// Seuil « bientôt dépassé » : moins de 25 % du délai restant
export const SEUIL_ALERTE = 0.25;

// 25 → « 25 min » ; 100 → « 1 h 40 » ; 180 → « 3 h » ; 1680 → « 1 j 4 h »
export function formaterDuree(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  if (m < 24 * 60) {
    const h = Math.floor(m / 60);
    const reste = m % 60;
    return reste ? `${h} h ${String(reste).padStart(2, "0")}` : `${h} h`;
  }
  const j = Math.floor(m / (24 * 60));
  const h = Math.floor((m % (24 * 60)) / 60);
  return h ? `${j} j ${h} h` : `${j} j`;
}

const ms = (d: string | Date) => new Date(d).getTime();

// null : pas de SLA (demande annulée ou sans échéance)
export function calculerSla(e: Entree): Sla | null {
  if (!e.dueAt || e.statut === "ANNULEE") return null;
  const maintenant = e.maintenant ?? Date.now();
  const debut = ms(e.createdAt);
  const echeance = ms(e.dueAt);
  const total = Math.max(1, echeance - debut);

  if (e.statut === "CLOTUREE") {
    const fin = e.closedAt ? ms(e.closedAt) : echeance;
    if (fin <= echeance)
      return { etat: "done", libelle: "Respecté", ratioRestant: 1 };
    return {
      etat: "late",
      libelle: `Hors délai · ${formaterDuree((fin - echeance) / 60000)}`,
      ratioRestant: 0,
    };
  }

  const restant = echeance - maintenant;
  if (restant <= 0) {
    return {
      etat: "late",
      libelle: `Dépassé · ${formaterDuree(-restant / 60000)}`,
      ratioRestant: 0,
    };
  }
  const ratioRestant = Math.min(1, restant / total);
  return {
    etat: ratioRestant < SEUIL_ALERTE ? "warn" : "ok",
    libelle: formaterDuree(restant / 60000),
    ratioRestant,
  };
}

// Délai de résolution d'une priorité, en texte (« 4 h », « 2 j »)
export const libelleDelai = (minutes: number | null | undefined) =>
  minutes ? formaterDuree(minutes) : null;
