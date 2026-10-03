"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { pluriel } from "@/lib/ui/format";

type Personne = { id: string; nom: string };

// Carte « Équipe en ligne » du bas de la sidebar (F12) : actifs depuis moins de 5 minutes
export default function EquipeEnLigne() {
  const [equipe, setEquipe] = useState<Personne[] | null>(null);

  useEffect(() => {
    const charger = () =>
      fetch("/api/presence/equipe")
        .then((r) => (r.ok ? r.json() : null))
        .then((l) => l && setEquipe(l))
        .catch(() => {});
    charger();
    const id = window.setInterval(() => {
      if (!document.hidden) charger();
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!equipe || equipe.length === 0) return null;
  return (
    <section
      aria-label="Équipe en ligne"
      className="rounded-xl border border-line bg-surface p-3.5"
    >
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-[12.5px] font-semibold">Équipe en ligne</p>
        <span className="flex items-center gap-1.5 text-[11.5px] text-success-fg">
          <span
            aria-hidden="true"
            className="size-[7px] animate-live rounded-full bg-success"
          />
          {pluriel(equipe.length, "actif")}
        </span>
      </div>
      <ul className="flex">
        {equipe.slice(0, 6).map((p, i) => (
          <li key={p.id} className={i > 0 ? "-ml-2" : undefined}>
            <Avatar
              id={p.id}
              name={p.nom}
              size={30}
              className="border-2 border-surface"
            />
          </li>
        ))}
        {equipe.length > 6 && (
          <li className="-ml-2 flex size-[30px] items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-[11px] font-semibold">
            +{equipe.length - 6}
          </li>
        )}
      </ul>
    </section>
  );
}
