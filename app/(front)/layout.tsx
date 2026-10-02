import "../../styles/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { classesPolices } from "@/app/fonts";
import OfflineToast from "@/components/etats/OfflineToast";
import MotionProvider from "@/components/motion/MotionProvider";
import Toaster from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "TechLine Care",
  description: "Portail interne de suivi des demandes de support.",
};

// Racine : polices, couleurs de base et animations. Le cadre (header, sidebar, footer)
// est posé par les groupes (app) et (public).
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={classesPolices}>
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
