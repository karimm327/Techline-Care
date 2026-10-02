"use client";

import { type Transition, useReducedMotion, type Variants } from "motion/react";
import { useEffect, useState } from "react";

// Trois courbes seulement (docs/refonte/04-animations.md)
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
export const EASE_IN = [0.4, 0, 1, 1] as const;
export const SPRING: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.9,
};
export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
};

// M01 — cascade d'entrée (+60 ms par bloc)
export const pageStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.56, ease: EASE_OUT } },
};

// M09 — palette / dialogue
export const dialogIn: Variants = {
  hidden: { opacity: 0, y: -10, scale: 0.97, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.28, ease: EASE_OUT },
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.16 } },
};

// Voile des dialogues et tiroirs
export const voile: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
};

// M10 — tiroir (droite : notifications ; gauche : sidebar mobile)
export const drawerRight: Variants = {
  hidden: { x: "104%" },
  show: { x: 0, transition: { duration: 0.38, ease: EASE_OUT } },
  exit: { x: "104%", transition: { duration: 0.26, ease: EASE_IN } },
};
export const drawerLeft: Variants = {
  hidden: { x: "-104%" },
  show: { x: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { x: "-104%", transition: { duration: 0.21, ease: EASE_IN } },
};

// Animations autorisées ? Non si prefers-reduced-motion OU classe no-motion sur <html>
export function useMotionAllowed(): boolean {
  const reduit = useReducedMotion();
  const [noMotion, setNoMotion] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const lire = () => setNoMotion(html.classList.contains("no-motion"));
    lire();
    const observateur = new MutationObserver(lire);
    observateur.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observateur.disconnect();
  }, []);

  return !reduit && !noMotion;
}
