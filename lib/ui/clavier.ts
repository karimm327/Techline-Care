import type { KeyboardEvent } from "react";

// Flèches / Début / Fin dans un groupe (onglets, segmented, menu) : renvoie l'index visé ou null
export function indexDepuisTouche(
  e: KeyboardEvent,
  courant: number,
  total: number,
  orientation: "horizontal" | "vertical" = "horizontal",
): number | null {
  const precedent = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";
  const suivant = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
  switch (e.key) {
    case precedent:
      return (courant - 1 + total) % total;
    case suivant:
      return (courant + 1) % total;
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}
