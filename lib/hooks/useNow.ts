"use client";

import { useEffect, useState } from "react";

// Heure courante rafraîchie toutes les `intervalle` ms.
// `initial` (heure du serveur) garantit le même premier rendu côté serveur et client.
export function useNow(initial: number, intervalle = 60_000): number {
  const [maintenant, setMaintenant] = useState(initial);
  useEffect(() => {
    setMaintenant(Date.now());
    const id = window.setInterval(() => setMaintenant(Date.now()), intervalle);
    return () => window.clearInterval(id);
  }, [intervalle]);
  return maintenant;
}
