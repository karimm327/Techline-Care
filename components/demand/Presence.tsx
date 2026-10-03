"use client";

import { useEffect, useSyncExternalStore } from "react";
import Avatar from "@/components/ui/Avatar";

// Présence sur une fiche (F12). Un seul composant <SignalPresence> par page interroge le
// serveur ; les autres (avatars du hero, indicateur de frappe) lisent le même état.

type Present = { id: string; nom: string; ecrit: boolean };

let presents: Present[] = [];
const abonnes = new Set<() => void>();
const publier = (l: Present[]) => {
  presents = l;
  for (const f of abonnes) f();
};
const sAbonner = (f: () => void) => {
  abonnes.add(f);
  return () => abonnes.delete(f);
};
const VIDE: Present[] = [];
const usePresents = () =>
  useSyncExternalStore(
    sAbonner,
    () => presents,
    () => VIDE,
  );

async function envoyer(demandId: string, state: "VIEW" | "TYPING") {
  try {
    const res = await fetch(`/api/demands/${demandId}/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (res.ok) publier(await res.json());
  } catch {
    // présence indicative : une erreur réseau est sans conséquence
  }
}

// Frappe dans le composer : au plus un signal toutes les 3 s
let derniereFrappe = 0;
export function signalerFrappe(demandId: string) {
  const maintenant = Date.now();
  if (maintenant - derniereFrappe < 3000) return;
  derniereFrappe = maintenant;
  envoyer(demandId, "TYPING");
}

export function SignalPresence({ demandId }: { demandId: string }) {
  useEffect(() => {
    envoyer(demandId, "VIEW");
    let id = window.setInterval(() => envoyer(demandId, "VIEW"), 15_000);
    const surVisibilite = () => {
      window.clearInterval(id);
      if (!document.hidden) {
        envoyer(demandId, "VIEW");
        id = window.setInterval(() => envoyer(demandId, "VIEW"), 15_000);
      }
    };
    document.addEventListener("visibilitychange", surVisibilite);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", surVisibilite);
      publier(VIDE);
    };
  }, [demandId]);
  return null;
}

// « Lucas consulte aussi cette demande » (hero)
export function AutresLecteurs() {
  const liste = usePresents();
  if (liste.length === 0) return null;
  const premier = liste[0].nom.split(" ")[0];
  const texte =
    liste.length === 1
      ? `${premier} consulte aussi cette demande`
      : `${premier} et ${liste.length - 1} autre${liste.length > 2 ? "s" : ""} consultent aussi cette demande`;
  return (
    <span
      className="ml-auto flex animate-rise items-center gap-1.5 text-[12.5px] text-fg-3"
      aria-live="polite"
    >
      <span className="flex">
        {liste.slice(0, 3).map((p, i) => (
          <Avatar
            key={p.id}
            id={p.id}
            name={p.nom}
            size={24}
            decorative
            className={
              i > 0
                ? "-ml-[7px] border-2 border-surface"
                : "border-2 border-surface"
            }
          />
        ))}
      </span>
      {texte}
    </span>
  );
}

// « Emma Bernard est en train d'écrire… » (M16)
export function IndicateurFrappe() {
  const ecrivent = usePresents().filter((p) => p.ecrit);
  if (ecrivent.length === 0) return null;
  const noms =
    ecrivent.length === 1
      ? `${ecrivent[0].nom} est en train d’écrire…`
      : `${ecrivent.length} personnes sont en train d’écrire…`;
  return (
    <p
      className="mt-[18px] flex items-center gap-2.5 text-[12.5px] text-fg-3"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="inline-flex gap-[3px] rounded-full bg-surface-2 px-3 py-2"
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce3 rounded-full bg-fg-2"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </span>
      {noms}
    </p>
  );
}
