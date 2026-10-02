"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { pageStagger } from "@/lib/motion";

type Props = {
  as?: "div" | "section" | "ul" | "ol";
  className?: string;
  children: ReactNode;
};

const ELEMENTS = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul,
  ol: motion.ol,
} as const;

// M01 — conteneur de cascade : ses enfants <Reveal> entrent l'un après l'autre
export default function Stagger({ as = "div", className, children }: Props) {
  const Element = ELEMENTS[as];
  return (
    <Element
      className={className}
      variants={pageStagger}
      initial="hidden"
      animate="show"
    >
      {children}
    </Element>
  );
}
