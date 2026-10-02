"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { EASE_IN_OUT } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import { ETAPES_STATUT, STATUTS } from "@/lib/ui/status";

// M12 — progression Nouvelle → En cours → Clôturée : ligne qui se remplit (scaleX 700 ms),
// pastille courante agrandie avec halo 6 px
export default function StatusStepper({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const etape = ETAPES_STATUT.indexOf(status as (typeof ETAPES_STATUT)[number]);
  const progression = etape <= 0 ? 0 : etape === 1 ? 0.5 : 1;
  const courant = etape >= 0 ? STATUTS[ETAPES_STATUT[etape]] : null;

  return (
    <ol
      aria-label="Progression"
      className={cn("relative grid grid-cols-3", className)}
    >
      <span
        aria-hidden="true"
        className="absolute left-[16.6%] right-[16.6%] top-[15px] h-[3px] rounded-[3px] bg-line"
      />
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute left-[16.6%] right-[16.6%] top-[15px] h-[3px] origin-left rounded-[3px] transition-colors duration-[400ms]",
          courant?.point ?? "bg-line",
        )}
        initial={false}
        animate={{ scaleX: progression }}
        transition={{ duration: 0.7, ease: EASE_IN_OUT }}
      />
      {ETAPES_STATUT.map((code, i) => {
        const faite = etape >= 0 && i <= etape;
        const enCours = i === etape;
        return (
          <li
            key={code}
            aria-current={enCours ? "step" : undefined}
            className="relative flex flex-col items-center gap-2"
          >
            <motion.span
              initial={false}
              animate={{ scale: enCours ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 18 }}
              className={cn(
                "relative z-[1] flex size-8 items-center justify-center rounded-full text-[13px] font-bold transition-colors duration-[450ms]",
                faite
                  ? cn(STATUTS[code].point, "text-ink")
                  : "bg-surface text-fg-4 ring-2 ring-inset ring-line-field",
                enCours && STATUTS[code].halo,
              )}
            >
              {faite && !enCours ? (
                <Check aria-hidden="true" strokeWidth={3} className="size-4" />
              ) : (
                i + 1
              )}
            </motion.span>
            <span
              className={cn(
                "text-[13px]",
                enCours ? "font-semibold" : "font-medium",
                faite ? "text-fg" : "text-fg-4",
              )}
            >
              {STATUTS[code].label}
              {faite && !enCours && (
                <span className="sr-only"> (terminée)</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
