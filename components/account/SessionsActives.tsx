"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { notifier } from "@/components/ui/Toast";
import { cn } from "@/lib/ui/cn";
import { ilYA } from "@/lib/ui/format";

type Session = {
  id: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
  actuelle: boolean;
};

// « Chrome · Windows » à partir de l'en-tête User-Agent (approximatif, affichage seulement)
function appareil(ua: string | null) {
  if (!ua) return { nom: "Appareil inconnu", mobile: false };
  const navigateur = /Edg\//.test(ua)
    ? "Edge"
    : /Firefox\//.test(ua)
      ? "Firefox"
      : /Chrome\//.test(ua)
        ? "Chrome"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Navigateur";
  const systeme = /Windows/.test(ua)
    ? "Windows"
    : /iPhone|iPad/.test(ua)
      ? "iOS"
      : /Android/.test(ua)
        ? "Android"
        : /Mac OS X/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return {
    nom: systeme ? `${navigateur} · ${systeme}` : navigateur,
    mobile: /iPhone|Android|Mobile/.test(ua),
  };
}

// Sessions actives (F14) : appareils connectés, révocation des autres sessions
export default function SessionsActives() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    fetch("/api/users/me/sessions")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  async function revoquer(s: Session) {
    try {
      const res = await fetch(`/api/users/me/sessions/${s.id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Révocation impossible.");
      setSessions((l) => (l ?? []).filter((x) => x.id !== s.id));
      notifier({
        titre: "Session révoquée",
        description: appareil(s.user_agent).nom,
        ton: "succes",
      });
    } catch (e) {
      notifier({
        titre: "Révocation impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    }
  }

  if (sessions === null) return <p className="text-fg-3">Chargement…</p>;
  if (sessions.length === 0)
    return (
      <p className="text-fg-3">
        Aucune session suivie : elles apparaissent à partir de votre prochaine
        connexion.
      </p>
    );

  return (
    <ul className="flex flex-col gap-2">
      {sessions.map((s) => {
        const a = appareil(s.user_agent);
        const Icone = a.mobile ? Smartphone : Monitor;
        return (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3",
              s.actuelle ? "bg-surface-inset" : "",
            )}
          >
            <Icone
              aria-hidden="true"
              strokeWidth={1.9}
              className="size-5 shrink-0 text-fg-3"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold">
                {a.nom}
                {s.actuelle && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-px text-[11px] font-semibold text-success-fg">
                    <span
                      aria-hidden="true"
                      className="size-1.5 animate-live rounded-full bg-success"
                    />
                    Cette session
                  </span>
                )}
              </p>
              <p className="text-[12.5px] text-fg-3">
                Dernière activité {ilYA(s.last_seen_at)}
              </p>
            </div>
            {!s.actuelle && (
              <Button variant="danger" size="sm" onClick={() => revoquer(s)}>
                Révoquer
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
