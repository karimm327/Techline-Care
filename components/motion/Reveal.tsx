"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { rise } from "@/lib/motion";

const ELEMENTS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  header: motion.header,
  li: motion.li,
} as const;

type Props = {
  as?: keyof typeof ELEMENTS;
  // Rang du bloc : +60 ms par rang, plafonné à 8 (M01)
  delay?: number;
  className?: string;
  children: ReactNode;
};

// M01 — un bloc qui monte en fondu. Dans un <Stagger>, la cascade est gérée par le parent.
export default function Reveal({
  as = "div",
  delay,
  className,
  children,
}: Props) {
  const Element = ELEMENTS[as];
  const autonome = delay !== undefined;
  return (
    <Element
      className={className}
      variants={rise}
      initial={autonome ? "hidden" : undefined}
      animate={autonome ? "show" : undefined}
      transition={
        autonome ? { delay: Math.min(delay, 8) * 0.06 + 0.04 } : undefined
      }
    >
      {children}
    </Element>
  );
}
