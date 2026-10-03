"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { notifier } from "@/components/ui/Toast";

type Similaire = { id: string; ref: string; title: string; status: string };

// Doublons possibles (F10) : demandes ouvertes au titre proche, 300 ms après la frappe
export default function DemandesSimilaires({
  titre,
  exclure,
  lierDepuis,
}: {
  titre: string;
  exclure?: string;
  // Édition : demande à marquer comme doublon (bouton « Lier comme doublon »)
  lierDepuis?: string;
}) {
  const [liste, setListe] = useState<Similaire[]>([]);
  const [liees, setLiees] = useState<string[]>([]);

  async function lier(d: Similaire) {
    try {
      const res = await fetch(`/api/demands/${lierDepuis}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cible: d.id, kind: "DOUBLON" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Lien impossible.");
      setLiees((l) => [...l, d.id]);
      notifier({
        titre: "Marquée comme doublon",
        description: `${d.ref} · ${d.title}`,
        ton: "succes",
      });
    } catch (e) {
      notifier({
        titre: "Lien impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    }
  }

  useEffect(() => {
    const q = titre.trim();
    if (q.length < 4) {
      setListe([]);
      return;
    }
    const controle = new AbortController();
    const minuteur = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q });
        if (exclure) params.set("exclude", exclure);
        const res = await fetch(`/api/demands/similaires?${params}`, {
          signal: controle.signal,
        });
        if (res.ok) setListe(await res.json());
      } catch {
        // recherche annulée ou réseau indisponible : rien à signaler
      }
    }, 300);
    return () => {
      controle.abort();
      window.clearTimeout(minuteur);
    };
  }, [titre, exclure]);

  if (liste.length === 0) return null;
  return (
    <section
      aria-label="Demandes similaires"
      aria-live="polite"
      className="-mt-2 animate-rise rounded-xl border border-st-nouvelle/30 bg-st-nouvelle/[.08] px-3.5 py-3 [animation-duration:350ms]"
    >
      <p className="mb-2 text-[12.5px] font-semibold text-st-nouvelle-fg">
        Demandes similaires déjà ouvertes
      </p>
      <ul className="flex flex-col gap-1.5">
        {liste.map((d) => (
          <li key={d.id} className="flex items-center gap-3">
            <Link
              href={`/demands/${d.id}`}
              target="_blank"
              className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xs text-[13px] text-fg-1 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
            >
              <span className="font-mono text-[11.5px] text-fg-4">{d.ref}</span>
              <span className="min-w-0 flex-1 truncate">{d.title}</span>
              <StatusBadge
                status={d.status}
                className="h-[22px] text-[11.5px]"
              />
              <span className="sr-only">(s’ouvre dans un nouvel onglet)</span>
            </Link>
            {lierDepuis &&
              (liees.includes(d.id) ? (
                <span className="text-[12px] font-semibold text-success-fg">
                  Liée
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => lier(d)}
                  className="shrink-0 rounded-xs text-[12px] font-semibold text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                >
                  Lier comme doublon
                </button>
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
