"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Recharge les données serveur à intervalle régulier, en pause quand l'onglet est caché
export default function RafraichissementAuto({
  intervalle = 30_000,
}: {
  intervalle?: number;
}) {
  const router = useRouter();
  useEffect(() => {
    const minuteur = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, intervalle);
    return () => window.clearInterval(minuteur);
  }, [router, intervalle]);
  return null;
}
