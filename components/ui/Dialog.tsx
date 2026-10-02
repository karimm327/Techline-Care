"use client";

import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useCoucheModale } from "@/lib/hooks/useCoucheModale";
import { dialogIn, voile } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import IconButton from "./IconButton";

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  // Boutons d'action en bas de la boîte
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  // Titre visible ou seulement lu par les lecteurs d'écran
  hideTitle?: boolean;
  className?: string;
};

const LARGEURS = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" } as const;

// Monté dans <body> une fois le client prêt (évite toute différence d'hydratation)
export function useMonteClient() {
  const [monte, setMonte] = useState(false);
  useEffect(() => setMonte(true), []);
  return monte;
}

// Dialogue modal — M09 : fond fondu + flou, boîte scale .97→1, y −10→0, blur 6→0
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideTitle = false,
  className,
}: Props) {
  const monte = useMonteClient();
  const boite = useRef<HTMLDivElement>(null);
  const idTitre = useId();
  const idDescription = useId();
  useCoucheModale(open, onClose, boite);

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-overlay flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 bg-scrim/60 backdrop-blur-sm"
            variants={voile}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={onClose}
          />
          <motion.div
            ref={boite}
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitre}
            aria-describedby={description ? idDescription : undefined}
            tabIndex={-1}
            variants={dialogIn}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              "relative w-full rounded-2xl border border-line-strong bg-surface shadow-xl outline-none",
              LARGEURS[size],
              className,
            )}
          >
            <div className="flex items-start gap-3 px-6 pb-2 pt-5">
              <div className="min-w-0 flex-1">
                <h2
                  id={idTitre}
                  className={cn(
                    "font-display text-h3 text-fg",
                    hideTitle && "sr-only",
                  )}
                >
                  {title}
                </h2>
                {description && (
                  <p id={idDescription} className="mt-1 text-fg-2">
                    {description}
                  </p>
                )}
              </div>
              <IconButton
                label="Fermer"
                size={36}
                onClick={onClose}
                className="-mr-2 -mt-1"
              >
                <X
                  aria-hidden="true"
                  strokeWidth={1.9}
                  className="size-[18px]"
                />
              </IconButton>
            </div>
            {children && <div className="px-6 pb-5 pt-2">{children}</div>}
            {footer && (
              <div className="flex flex-wrap justify-end gap-2 border-t border-line px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
