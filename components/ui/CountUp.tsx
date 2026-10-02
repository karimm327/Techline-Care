"use client";

import { useEffect, useState } from "react";
import { useMotionAllowed } from "@/lib/motion";

type Props = {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
};

const formater = (v: number, decimales: number) =>
  v.toLocaleString("fr-FR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });

// M02 — compteur 0 → valeur (easeOutCubic). Sans animation : valeur finale directe.
export default function CountUp({
  value,
  decimals = 0,
  duration = 1100,
  className,
}: Props) {
  const anime = useMotionAllowed();
  const [affiche, setAffiche] = useState(value);

  useEffect(() => {
    if (!anime) {
      setAffiche(value);
      return;
    }
    let image = 0;
    const debut = performance.now();
    const pas = (t: number) => {
      const p = Math.min(1, (t - debut) / duration);
      setAffiche(value * (1 - (1 - p) ** 3));
      if (p < 1) image = requestAnimationFrame(pas);
    };
    setAffiche(0);
    image = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(image);
  }, [value, duration, anime]);

  return (
    <span className={className}>
      <span aria-hidden="true">{formater(affiche, decimals)}</span>
      <span className="sr-only">{formater(value, decimals)}</span>
    </span>
  );
}
