"use client";

import { type ReactNode, useEffect, useSyncExternalStore } from "react";

// Commandes contextuelles proposées par la page courante dans la palette Ctrl K
// (ex. la fiche demande : « Passer en cours », « Modifier »…).
export type CommandeContextuelle = {
  id: string;
  label: string;
  icone?: ReactNode;
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

// Ouverture de la palette depuis n'importe quel composant (barre de recherche du header)
const EVT_PALETTE = "tl:palette";

export const ouvrirPalette = () => window.dispatchEvent(new Event(EVT_PALETTE));

export function useOuverturePalette(f: () => void) {
  useEffect(() => {
    window.addEventListener(EVT_PALETTE, f);
    return () => window.removeEventListener(EVT_PALETTE, f);
  }, [f]);
}
