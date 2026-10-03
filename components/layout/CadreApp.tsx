"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { Logo } from "@/components/brand/LogoMark";
import CentreCommandes from "@/components/command/CentreCommandes";
import Drawer from "@/components/ui/Drawer";
import IconButton from "@/components/ui/IconButton";
import { cn } from "@/lib/ui/cn";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import type { UtilisateurShell } from "./types";

// Préférence locale sans enjeu (doc 02-layout) : sidebar repliée ou non
const CLE_SIDEBAR = "tl.sidebar";

type Props = {
  utilisateur: UtilisateurShell;
  footer: ReactNode;
  children: ReactNode;
};

// Partie cliente de l'AppShell : header, sidebar (repliable), tiroir mobile, contenu, footer
export default function CadreApp({ utilisateur, footer, children }: Props) {
  const chemin = usePathname();
  const [replie, setReplie] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);

  useEffect(() => {
    try {
      setReplie(localStorage.getItem(CLE_SIDEBAR) === "repliee");
    } catch {
      // stockage indisponible : sidebar dépliée
    }
  }, []);

  // Le tiroir mobile se ferme à chaque navigation
  // biome-ignore lint/correctness/useExhaustiveDependencies: fermeture volontaire à chaque changement de route
  useEffect(() => {
    setTiroirOuvert(false);
  }, [chemin]);

  const basculerRepli = () => {
    setReplie((v) => {
      try {
        localStorage.setItem(CLE_SIDEBAR, v ? "depliee" : "repliee");
      } catch {
        // préférence non mémorisée
      }
      return !v;
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#contenu"
        className="sr-only z-palette rounded-sm bg-accent px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Aller au contenu
      </a>

      <AppHeader
        utilisateur={utilisateur}
        ouvrirMenuMobile={() => setTiroirOuvert(true)}
        menuMobileOuvert={tiroirOuvert}
      />

      <div className="flex flex-1">
        <aside
          aria-label="Menu latéral"
          className={cn(
            "sticky top-14 hidden h-[calc(100dvh-3.5rem)] shrink-0 border-r border-line bg-bg-sunken lg:block",
            replie
              ? "w-sidebar-collapsed overflow-visible"
              : "w-sidebar overflow-y-auto",
          )}
        >
          <Sidebar
            estAdmin={utilisateur.estAdmin}
            replie={replie}
            basculerRepli={basculerRepli}
          />
        </aside>

        <main
          id="contenu"
          tabIndex={-1}
          className="flex min-w-0 flex-1 flex-col gap-6 px-4 pb-10 pt-7 outline-none sm:px-8"
        >
          {children}
        </main>
      </div>

      {footer}

      {/* Palette Ctrl K, raccourcis globaux et feuille d'aide « ? » */}
      <CentreCommandes utilisateur={utilisateur} />

      {/* Mobile (< 1024 px) : la sidebar devient un tiroir gauche */}
      <Drawer
        open={tiroirOuvert}
        onClose={() => setTiroirOuvert(false)}
        title="Menu"
        side="left"
        width={300}
        header={(idTitre) => (
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <h2 id={idTitre} className="sr-only">
              Menu
            </h2>
            <Logo href="/demands" />
            <IconButton
              label="Fermer le menu"
              onClick={() => setTiroirOuvert(false)}
            >
              <X aria-hidden="true" strokeWidth={1.9} className="size-5" />
            </IconButton>
          </div>
        )}
      >
        <Sidebar
          estAdmin={utilisateur.estAdmin}
          idIndicateur="nav-indicator-mobile"
        />
      </Drawer>
    </div>
  );
}
