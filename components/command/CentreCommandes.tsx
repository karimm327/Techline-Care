"use client";

import { Suspense } from "react";
import type { UtilisateurShell } from "@/components/layout/types";
import CommandPalette from "./CommandPalette";

// Palette de recherche, montée une seule fois dans l'AppShell (ouverte depuis la barre de recherche)
export default function CentreCommandes({
  utilisateur,
}: {
  utilisateur: UtilisateurShell;
}) {
  return (
    <Suspense fallback={null}>
      <CommandPalette utilisateur={utilisateur} />
    </Suspense>
  );
}
