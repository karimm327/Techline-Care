"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import Tabs, { TabPanel } from "@/components/ui/Tabs";

export type OngletCompte = { value: string; label: string; contenu: ReactNode };

// Anciennes ancres (#securite, #droits…) → onglets
const ANCRES: Record<string, string> = {
  profil: "profil",
  apercu: "profil",
  support: "profil",
  securite: "securite",
  droits: "droits",
};

// Carte profil (entête fourni par le serveur) + onglets dont l'état est dans l'URL (?onglet=…)
export default function OngletsCompte({
  entete,
  onglets,
  initial,
}: {
  entete: ReactNode;
  onglets: OngletCompte[];
  initial: string;
}) {
  const router = useRouter();
  const chemin = usePathname();
  const [actif, setActif] = useState(initial);

  useEffect(() => {
    const ancre = window.location.hash.replace("#", "");
    if (ANCRES[ancre] && onglets.some((o) => o.value === ANCRES[ancre]))
      setActif(ANCRES[ancre]);
  }, [onglets]);

  const choisir = (v: string) => {
    setActif(v);
    router.replace(`${chemin}?onglet=${v}`, { scroll: false });
  };

  return (
    <>
      <section className="animate-rise overflow-hidden rounded-md border border-line bg-surface">
        {entete}
        <Tabs
          id="compte"
          label="Sections du compte"
          items={onglets.map(({ value, label }) => ({ value, label }))}
          value={actif}
          onChange={choisir}
          className="border-b-0 border-t border-line px-4"
        />
      </section>
      {onglets.map((o) => (
        <TabPanel
          key={o.value}
          id="compte"
          value={o.value}
          active={o.value === actif}
        >
          {o.contenu}
        </TabPanel>
      ))}
    </>
  );
}
