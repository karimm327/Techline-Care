import "../../styles/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { classesPolices } from "@/app/fonts";
import OfflineToast from "@/components/etats/OfflineToast";
import MotionProvider from "@/components/motion/MotionProvider";
import Toaster from "@/components/ui/Toast";
import { getSessionUser } from "@/lib/auth/session";
import {
  findPreferences,
  PREFERENCES_DEFAUT,
} from "@/lib/db/queries/preference.queries";
import { cn } from "@/lib/ui/cn";

export const metadata: Metadata = {
  title: "TechLine Care",
  description: "Portail interne de suivi des demandes de support.",
};

// Racine : polices, couleurs de base et animations. Le cadre (header, sidebar, footer)
// est posé par les groupes (app) et (public).
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Préférences (F14) : animations, densité, raccourcis — appliquées dès le rendu serveur
  const user = await getSessionUser();
  const prefs = user
    ? await findPreferences(user.id).catch(() => PREFERENCES_DEFAUT)
    : PREFERENCES_DEFAUT;
  return (
    <html
      lang="fr"
      className={cn(
        classesPolices,
        !prefs.motion && "no-motion",
        prefs.density === "compact" && "density-compact",
      )}
      data-raccourcis={prefs.shortcuts ? "on" : "off"}
    >
      <body className="min-h-screen bg-bg font-sans text-sm leading-normal text-fg antialiased selection:bg-accent/40">
        <MotionProvider>
          {children}
          <Toaster />
          <OfflineToast />
        </MotionProvider>
      </body>
    </html>
  );
}
