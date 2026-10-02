"use client";

import {
  ChevronDown,
  Menu as IconeMenu,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/brand/LogoMark";
import Avatar from "@/components/ui/Avatar";
import { classesBouton } from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import IconButton from "@/components/ui/IconButton";
import Menu from "@/components/ui/Menu";
import { useScrolled } from "@/lib/hooks/useScrolled";
import { cn } from "@/lib/ui/cn";
import Breadcrumbs from "./Breadcrumbs";
import type { UtilisateurShell } from "./types";

type Props = {
  utilisateur: UtilisateurShell;
  ouvrirMenuMobile: () => void;
  menuMobileOuvert: boolean;
};

// Déconnexion : le cookie httpOnly est supprimé côté serveur
async function deconnecter() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  window.location.href = "/login";
}

export default function AppHeader({
  utilisateur,
  ouvrirMenuMobile,
  menuMobileOuvert,
}: Props) {
  const compacte = useScrolled(8);
  const [rechercheOuverte, setRechercheOuverte] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-header flex flex-wrap items-center gap-3.5 border-b border-line-strong/70 bg-bg/85 px-4 py-2.5 backdrop-blur-md sm:px-5",
        "transition-[min-height,box-shadow] duration-200 ease-out",
        compacte ? "min-h-14 shadow-sm" : "min-h-header",
      )}
    >
      <IconButton
        label="Ouvrir le menu"
        aria-expanded={menuMobileOuvert}
        onClick={ouvrirMenuMobile}
        className="-ml-2 lg:hidden"
      >
        <IconeMenu aria-hidden="true" strokeWidth={1.9} className="size-5" />
      </IconButton>

      <Logo href="/demands" />

      <span
        aria-hidden="true"
        className="hidden h-[22px] w-px bg-line-strong md:block"
      />
      <Breadcrumbs className="hidden md:flex" />

      <button
        type="button"
        onClick={() => setRechercheOuverte(true)}
        aria-label="Rechercher"
        className={cn(
          "cible-tactile ml-auto flex h-10 min-w-0 max-w-[460px] flex-1 basis-[220px] items-center gap-2.5 rounded-sm border border-line-strong/70 bg-surface px-3 text-left text-fg-3",
          "transition-colors duration-[180ms] hover:bg-surface-2 hover:text-fg",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
        )}
      >
        <Search
          aria-hidden="true"
          strokeWidth={2}
          className="size-4 shrink-0"
        />
        <span className="flex-1 truncate text-[13.5px]">
          Rechercher une demande, une personne, une action…
        </span>
      </button>

      <div className="flex items-center gap-1.5">
        {!utilisateur.lectureSeule && (
          <Link
            href="/demands/new"
            aria-label="Nouvelle demande"
            className={classesBouton({ className: "px-3 md:px-4" })}
          >
            <Plus aria-hidden="true" strokeWidth={2.2} className="size-4" />
            <span className="hidden md:inline">Nouvelle demande</span>
          </Link>
        )}

        <Menu
          label="Mon compte"
          items={[
            {
              type: "header",
              content: (
                <>
                  <p className="truncate text-[13px] font-semibold text-fg">
                    {utilisateur.nom}
                  </p>
                  <p className="truncate text-xs text-fg-3">
                    {utilisateur.email}
                  </p>
                </>
              ),
            },
            {
              label: "Mon compte",
              href: "/account",
              icon: <User strokeWidth={1.9} className="size-4" />,
            },
            {
              label: "Mes droits",
              href: "/account?onglet=droits",
              icon: <ShieldCheck strokeWidth={1.9} className="size-4" />,
            },
            { type: "separator" },
            {
              label: "Déconnexion",
              tone: "danger",
              icon: <LogOut strokeWidth={1.9} className="size-4" />,
              onSelect: deconnecter,
            },
          ]}
          trigger={(props, ouvert) => (
            <button
              type="button"
              {...props}
              aria-label={`Mon compte : ${utilisateur.nom}, ${utilisateur.libelleRole}`}
              className={cn(
                "flex h-11 items-center gap-2.5 rounded-[12px] pl-1 pr-1 transition-colors duration-[180ms] hover:bg-surface-2 md:pr-2",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
                ouvert && "bg-surface-2",
              )}
            >
              <Avatar
                id={utilisateur.id}
                name={utilisateur.nom}
                presence
                decorative
              />
              <span className="hidden text-left leading-tight md:block">
                <span className="block max-w-[160px] truncate text-[13px] font-semibold text-fg">
                  {utilisateur.nom}
                </span>
                <span className="block text-[11.5px] text-fg-3">
                  {utilisateur.libelleRole}
                </span>
              </span>
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1.9}
                className={cn(
                  "hidden size-4 text-fg-3 transition-transform duration-[250ms] md:block",
                  ouvert && "rotate-180",
                )}
              />
            </button>
          )}
        />
      </div>

      {/* La palette de commandes (Ctrl K) arrive à l'étape 9 */}
      <Dialog
        open={rechercheOuverte}
        onClose={() => setRechercheOuverte(false)}
        title="Rechercher"
        description="La recherche rapide sera disponible prochainement."
        size="sm"
      />
    </header>
  );
}
