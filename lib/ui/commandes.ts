"use client";

import { type ReactNode, useEffect, useSyncExternalStore } from "react";

// Commandes contextuelles proposées par la page courante dans la palette Ctrl K
// (ex. la fiche demande : « Passer en cours », « Modifier »…).
export type CommandeContextuelle = {
  id: string;
  label: string;
  icone?: ReactNode;
  // Raccourci affiché à droite (ex. "E", "1")
  touche?: string;
  // Mots-clés supplémentaires pour le filtrage
  motsCles?: string[];
  action: () => void;
};

let commandes: CommandeContextuelle[] = [];
const abonnes = new Set<() => void>();

function publier(liste: CommandeContextuelle[]) {
  commandes = liste;
  for (const f of abonnes) f();
}

function sAbonner(f: () => void) {
  abonnes.add(f);
  return () => abonnes.delete(f);
}

const VIDE: CommandeContextuelle[] = [];

export function useCommandesContextuelles(): CommandeContextuelle[] {
  return useSyncExternalStore(
    sAbonner,
    () => commandes,
    () => VIDE,
  );
}

// À appeler dans une page : les commandes sont retirées quand le composant disparaît
export function useDeclarerCommandes(liste: CommandeContextuelle[]) {
  useEffect(() => {
    publier(liste);
    return () => {
      if (commandes === liste) publier(VIDE);
    };
  }, [liste]);
}

// Ouverture de la palette et de la feuille d'aide depuis n'importe quel composant
const EVT_PALETTE = "tl:palette";
const EVT_AIDE = "tl:aide-raccourcis";

export const ouvrirPalette = () => window.dispatchEvent(new Event(EVT_PALETTE));
export const ouvrirAideRaccourcis = () =>
  window.dispatchEvent(new Event(EVT_AIDE));

export function useEvenement(nom: "palette" | "aide", f: () => void) {
  useEffect(() => {
    const evt = nom === "palette" ? EVT_PALETTE : EVT_AIDE;
    window.addEventListener(evt, f);
    return () => window.removeEventListener(evt, f);
  }, [nom, f]);
}
