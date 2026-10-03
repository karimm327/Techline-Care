"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Notification } from "@/lib/db/queries/notification.queries";

const INTERVALLE = 30_000;

// Notifications de l'utilisateur (F5) : interrogées toutes les 30 s, en pause quand l'onglet
// est caché. `surNouvelle` est appelé quand le nombre de non lues augmente.
export function useNotifications(surNouvelle?: (n: Notification) => void) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [onglet, setOnglet] = useState("tout");
  const [chargement, setChargement] = useState(true);
  const precedentes = useRef<number | null>(null);
  const rappel = useRef(surNouvelle);
  rappel.current = surNouvelle;

  const charger = useCallback(async (ongletDemande: string) => {
    try {
      const res = await fetch(`/api/notifications?onglet=${ongletDemande}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: Notification[];
        nonLues: number;
      };
      setNotifications(data.notifications);
      setNonLues(data.nonLues);
      if (
        precedentes.current !== null &&
        data.nonLues > precedentes.current &&
        data.notifications[0]
      ) {
        rappel.current?.(data.notifications[0]);
      }
      precedentes.current = data.nonLues;
    } catch {
      // réseau indisponible : nouvel essai au prochain intervalle
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    charger(onglet);
    let id: number | undefined;
    const demarrer = () => {
      window.clearInterval(id);
      id = window.setInterval(() => charger(onglet), INTERVALLE);
    };
    const surVisibilite = () => {
      if (document.hidden) window.clearInterval(id);
      else {
        charger(onglet);
        demarrer();
      }
    };
    demarrer();
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", surVisibilite);
    };
  }, [charger, onglet]);

  const marquerLues = useCallback(async (ids?: string[]) => {
    // Mise à jour immédiate de l'affichage, puis du serveur
    setNotifications((l) =>
      l.map((n) =>
        !ids || ids.includes(n.id)
          ? { ...n, read_at: n.read_at ?? new Date().toISOString() }
          : n,
      ),
    );
    setNonLues((n) => (ids ? Math.max(0, n - ids.length) : 0));
    precedentes.current = ids
      ? Math.max(0, (precedentes.current ?? 0) - ids.length)
      : 0;
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    }).catch(() => {});
  }, []);

  return {
    notifications,
    nonLues,
    onglet,
    setOnglet,
    chargement,
    marquerLues,
    recharger: () => charger(onglet),
  };
}
