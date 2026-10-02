"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

// Lecture / écriture des filtres dans l'URL (?statut=A,B&q=…), sans remonter en haut de page
export function useParametresUrl() {
  const router = useRouter();
  const chemin = usePathname();
  const params = useSearchParams();

  const liste = useCallback(
    (cle: string) =>
      (params.get(cle) ?? "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    [params],
  );

  // null ou liste vide = paramètre retiré ; toute modification de filtre revient à la page 1
  const modifier = useCallback(
    (changements: Record<string, string | string[] | null>) => {
      const suivant = new URLSearchParams(params.toString());
      for (const [cle, valeur] of Object.entries(changements)) {
        const texte = Array.isArray(valeur) ? valeur.join(",") : valeur;
        if (texte) suivant.set(cle, texte);
        else suivant.delete(cle);
      }
      if (!("page" in changements)) suivant.delete("page");
      const q = suivant.toString();
      router.replace(`${chemin}${q ? `?${q}` : ""}`, { scroll: false });
    },
    [params, router, chemin],
  );

  return { params, liste, modifier };
}
