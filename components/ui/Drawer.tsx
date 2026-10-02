"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { useCoucheModale } from "@/lib/hooks/useCoucheModale";
import { drawerLeft, drawerRight, voile } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import { useMonteClient } from "./Dialog";
import IconButton from "./IconButton";

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: "left" | "right";
  width?: number;
  // En-tête personnalisé (remplace le titre par défaut, garder un élément avec l'id fourni)
  header?: (idTitre: string) => ReactNode;
  children: ReactNode;
  className?: string;
};

// Tiroir latéral — M10 : translateX 104 % → 0 en 380 ms (sortie 260 ms), focus piégé
export default function Drawer({
  open,
  onClose,
  title,
  side = "right",
  width = 400,
  header,
  children,
  className,
}: Props) {
  const monte = useMonteClient();
  const panneau = useRef<HTMLDivElement>(null);
  const idTitre = useId();
  useCoucheModale(open, onClose, panneau);

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-overlay">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-scrim/60 backdrop-blur-[2px]"
            variants={voile}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            ref={panneau}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitre}
            tabIndex={-1}
            variants={side === "right" ? drawerRight : drawerLeft}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ width }}
            className={cn(
              "absolute inset-y-0 flex max-w-[88vw] flex-col bg-bg-sunken shadow-xl outline-none",
              side === "right"
                ? "right-0 border-l border-line-strong"
                : "left-0 border-r border-line-strong",
              className,
            )}
          >
            {header ? (
              header(idTitre)
            ) : (
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
                <h2 id={idTitre} className="font-display text-h3 text-fg">
                  {title}
                </h2>
                <IconButton label="Fermer" onClick={onClose}>
                  <X aria-hidden="true" strokeWidth={1.9} className="size-5" />
                </IconButton>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
