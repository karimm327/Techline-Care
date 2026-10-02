"use client";

import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Dialogue / tiroir ouvert : focus piégé, Échap ferme, défilement bloqué,
// focus rendu à l'élément d'origine à la fermeture.
export function useCoucheModale(
  ouvert: boolean,
  fermer: () => void,
  conteneur: RefObject<HTMLElement | null>,
) {
  const fermerRef = useRef(fermer);
  fermerRef.current = fermer;

  useEffect(() => {
    if (!ouvert) return;
    const origine = document.activeElement as HTMLElement | null;
    const ancienDefilement = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const elements = () =>
      Array.from(
        conteneur.current?.querySelectorAll<HTMLElement>(FOCUSABLES) ?? [],
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );

    // Focus initial : [data-autofocus], sinon le premier élément focusable, sinon la boîte
    const minuteur = window.setTimeout(() => {
      const cible =
        conteneur.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        elements()[0] ??
        conteneur.current;
      cible?.focus();
    }, 20);

    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        fermerRef.current();
        return;
      }
      if (e.key !== "Tab") return;
      const liste = elements();
      if (liste.length === 0) {
        e.preventDefault();
        return;
      }
      const premier = liste[0];
      const dernier = liste[liste.length - 1];
      if (e.shiftKey && document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      } else if (!e.shiftKey && document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    };
    document.addEventListener("keydown", surTouche);

    return () => {
      window.clearTimeout(minuteur);
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = ancienDefilement;
      origine?.focus?.();
    };
  }, [ouvert, conteneur]);
}
