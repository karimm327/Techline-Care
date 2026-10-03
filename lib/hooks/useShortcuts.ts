"use client";

import { useEffect, useRef } from "react";

// Raccourcis clavier (F2, docs/refonte/06-features.md).
// Combinaisons : "mod+k" (Ctrl ou ⌘), "n", "?", "1", et séquences "g d" (G puis D).
// Un seul écouteur sur le document pour tous les composants : une séquence commencée
// (« g ») est partagée, donc « g c » ne déclenche pas le « c » de la fiche demande.

export type Raccourcis = Record<string, (e: KeyboardEvent) => void>;

type Enregistrement = { raccourcis: { current: Raccourcis } };

const enregistrements: Enregistrement[] = [];
let prefixe: { touche: string; t: number } | null = null;
const DELAI_SEQUENCE = 1200;

// Raccourcis désactivés par la préférence utilisateur (data-raccourcis="off" sur <html>)
const desactives = () => document.documentElement.dataset.raccourcis === "off";

function dansUnChamp(cible: EventTarget | null) {
  const el = cible as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function jeton(e: KeyboardEvent): string | null {
  if (["Control", "Meta", "Shift", "Alt"].includes(e.key)) return null;
  const touche = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (e.ctrlKey || e.metaKey) return `mod+${touche}`;
  if (e.altKey) return null;
  return touche;
}

// Le plus récent (composant le plus profond) passe en premier
function trouver(combo: string) {
  for (let i = enregistrements.length - 1; i >= 0; i--) {
    const f = enregistrements[i].raccourcis.current[combo];
    if (f) return f;
  }
  return null;
}

function commenceSequence(touche: string) {
  return enregistrements.some((r) =>
    Object.keys(r.raccourcis.current).some((k) => k.startsWith(`${touche} `)),
  );
}

function surTouche(e: KeyboardEvent) {
  if (e.defaultPrevented || e.isComposing) return;
  const t = jeton(e);
  if (!t) return;

  // Ctrl K reste disponible partout (champ, dialogue ouvert, préférence désactivée)
  if (t === "mod+k") {
    const f = trouver(t);
    if (f) {
      e.preventDefault();
      f(e);
    }
    return;
  }
  if (desactives() || dansUnChamp(e.target)) return;
  // Un dialogue est ouvert : il gère lui-même son clavier
  if (document.querySelector('[aria-modal="true"]')) return;

  if (prefixe && Date.now() - prefixe.t < DELAI_SEQUENCE) {
    const f = trouver(`${prefixe.touche} ${t}`);
    prefixe = null;
    if (f) {
      e.preventDefault();
      f(e);
    }
    return;
  }
  prefixe = null;

  if (commenceSequence(t)) {
    prefixe = { touche: t, t: Date.now() };
    return;
  }
  const f = trouver(t);
  if (f) {
    e.preventDefault();
    f(e);
  }
}

export function useShortcuts(raccourcis: Raccourcis, actif = true) {
  const ref = useRef(raccourcis);
  ref.current = raccourcis;

  useEffect(() => {
    if (!actif) return;
    const enr: Enregistrement = { raccourcis: ref };
    if (enregistrements.length === 0)
      document.addEventListener("keydown", surTouche);
    enregistrements.push(enr);
    return () => {
      enregistrements.splice(enregistrements.indexOf(enr), 1);
      if (enregistrements.length === 0)
        document.removeEventListener("keydown", surTouche);
    };
  }, [actif]);
}

// Libellé du modificateur selon la plateforme (« ⌘ » sur Mac, « Ctrl » ailleurs)
export function libelleMod(): string {
  if (typeof navigator === "undefined") return "Ctrl";
  return /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
}
