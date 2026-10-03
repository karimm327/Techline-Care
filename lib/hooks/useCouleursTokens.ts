"use client";

import { useEffect, useState } from "react";

// Valeurs des tokens couleur lues dans styles/tokens.css (« 124 140 255 » → « rgb(124 140 255) »).
// Les graphiques SVG (recharts) reçoivent les couleurs en attributs, où var() ne s'applique pas.
const TOKENS = [
  "accent-soft",
  "st-cloturee",
  "st-encours",
  "prio-haute",
  "line-soft",
  "surface-2",
  "line-strong",
  "fg",
  "fg-2",
  "fg-3",
  "avatar-1",
  "avatar-2",
  "avatar-3",
  "avatar-4",
  "avatar-5",
  "avatar-6",
] as const;

export type CouleursTokens = Record<(typeof TOKENS)[number], string>;

export function useCouleursTokens(): CouleursTokens | null {
  const [couleurs, setCouleurs] = useState<CouleursTokens | null>(null);
  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const lu = {} as CouleursTokens;
    for (const t of TOKENS) {
      const v = style.getPropertyValue(`--${t}`).trim();
      lu[t] = v.startsWith("#") || v.startsWith("rgb") ? v : `rgb(${v})`;
    }
    setCouleurs(lu);
  }, []);
  return couleurs;
}
