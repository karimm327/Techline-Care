"use client";

import { useEffect, useState } from "react";

// Vrai dès que la page a défilé de plus de `seuil` pixels (compactage du header)
export function useScrolled(seuil = 8): boolean {
  const [defile, setDefile] = useState(false);
  useEffect(() => {
    const lire = () => setDefile(window.scrollY > seuil);
    lire();
    window.addEventListener("scroll", lire, { passive: true });
    return () => window.removeEventListener("scroll", lire);
  }, [seuil]);
  return defile;
}
