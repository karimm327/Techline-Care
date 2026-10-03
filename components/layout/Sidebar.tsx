"use client";

import {
  Activity,
  ChartLine,
  Columns3,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { Vue } from "@/lib/db/queries/view.queries";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import { estActif, type IconeNav, SECTIONS_NAV } from "./navigation";
import SectionVues from "./SectionVues";

const ICONES: Record<IconeNav, ReactNode> = {
  tableau: <LayoutDashboard strokeWidth={1.9} className="size-[18px]" />,
  kanban: <Columns3 strokeWidth={1.9} className="size-[18px]" />,
  stats: <ChartLine strokeWidth={1.9} className="size-[18px]" />,
  journal: <Activity strokeWidth={1.9} className="size-[18px]" />,
};

type Props = {
  estAdmin: boolean;
  // Rôle LECTURE : entrées réservées aux agents masquées
  lectureSeule?: boolean;
  // Vues enregistrées (F7), affichées après « Pilotage »
  vues?: Vue[];
  // Sidebar repliée à 72 px (icônes + infobulles)
  replie?: boolean;
  // Absent dans le tiroir mobile (pas de repli)
  basculerRepli?: () => void;
  // Identifiant de l'indicateur animé (M03), distinct entre sidebar et tiroir
  idIndicateur?: string;
  className?: string;
};

// Navigation principale : sections par rôle, item actif avec barre lumineuse animée (M03)
export default function Sidebar({
  estAdmin,
  lectureSeule = false,
  vues = [],
  replie = false,
  basculerRepli,
  idIndicateur = "nav-indicator",
  className,
}: Props) {
  const chemin = usePathname();
  const mode = useSearchParams().get("mode");
  const sections = SECTIONS_NAV.filter((s) => !s.adminSeulement || estAdmin);

  return (
    <div
      className={cn(
        "flex h-full flex-col gap-5 px-3 py-[18px]",
        replie && "items-center px-2",
        className,
      )}
    >
      <nav
        aria-label="Navigation principale"
        className="flex flex-col gap-[18px]"
      >
        {sections.map((section, indexSection) => (
          <div key={section.titre} className="contents">
            <div className="flex flex-col gap-0.5">
              {replie ? (
                <hr className="mx-auto mb-1.5 w-6 border-line" />
              ) : (
                <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[.08em] text-fg-4">
                  {section.titre}
                </p>
              )}
              <ul className="flex flex-col gap-0.5">
                {section.liens
                  .filter((lien) => !(lien.pasLecture && lectureSeule))
                  .map((lien) => {
                    const actif = estActif(lien.href, chemin, mode);
                    return (
                      <li key={lien.href} className="relative">
                        <Link
                          href={lien.href}
                          aria-current={actif ? "page" : undefined}
                          aria-label={replie ? lien.label : undefined}
                          className={cn(
                            "cible-tactile group relative flex h-10 items-center gap-[11px] rounded-[9px] px-3 transition-colors duration-[180ms]",
                            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-soft",
                            replie && "w-11 justify-center px-0",
                            actif
                              ? "bg-accent/15 font-semibold text-fg"
                              : "text-fg-2 hover:bg-surface-hover hover:text-fg",
                          )}
                        >
                          {actif && (
                            <motion.span
                              layoutId={idIndicateur}
                              transition={SPRING}
                              aria-hidden="true"
                              className={cn(
                                "absolute bottom-[9px] top-[9px] w-[3px] rounded-r-[3px] bg-accent shadow-glow-nav",
                                replie ? "-left-2" : "-left-3",
                              )}
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className={cn("flex", actif && "text-accent-fg")}
                          >
                            {ICONES[lien.icone]}
                          </span>
                          {replie ? (
                            // Infobulle au survol / focus clavier
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute left-full top-1/2 z-overlay ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-[8px] border border-line-strong bg-surface-2 px-2.5 py-1.5 text-[12.5px] font-medium text-fg shadow-lg group-hover:block group-focus-visible:block"
                            >
                              {lien.label}
                            </span>
                          ) : (
                            <>
                              <span className="flex-1 truncate">
                                {lien.label}
                              </span>
                              {lien.badge && (
                                <span className="rounded-full bg-success/15 px-[7px] py-px text-[10px] font-bold tracking-[.06em] text-success-fg">
                                  {lien.badge}
                                </span>
                              )}
                            </>
                          )}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
            {indexSection === 0 && !replie && <SectionVues vues={vues} />}
          </div>
        ))}
      </nav>

      {basculerRepli && (
        <button
          type="button"
          onClick={basculerRepli}
          aria-label={replie ? "Déplier le menu" : "Replier le menu"}
          aria-expanded={!replie}
          title={replie ? "Déplier le menu" : "Replier le menu"}
          className={cn(
            "cible-tactile mt-auto flex h-10 items-center gap-[11px] rounded-[9px] px-3 text-[13px] text-fg-3 transition-colors duration-[180ms] hover:bg-surface-hover hover:text-fg",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-soft",
            replie && "w-11 justify-center px-0",
          )}
        >
          {replie ? (
            <PanelLeftOpen
              aria-hidden="true"
              strokeWidth={1.9}
              className="size-[18px]"
            />
          ) : (
            <>
              <PanelLeftClose
                aria-hidden="true"
                strokeWidth={1.9}
                className="size-[18px]"
              />
              Replier le menu
            </>
          )}
        </button>
      )}
    </div>
  );
}
