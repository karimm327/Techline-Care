"use client";

import { useMotionAllowed } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";

const COULEURS = [
  "bg-success",
  "bg-accent-soft",
  "bg-st-encours",
  "bg-st-nouvelle",
  "bg-prio-haute",
  "bg-accent-fg-2",
];

// 22 particules réparties en cercle (calcul déterministe, identique à chaque rendu)
const PARTICULES = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2;
  const distance = 70 + (i % 4) * 22;
  return {
    id: i,
    couleur: COULEURS[i % COULEURS.length],
    forme: i % 3 ? "rounded-[2px]" : "rounded-full",
    largeur: i % 3 ? 7 : 10,
    hauteur: i % 2 ? 7 : 4,
    dx: Math.round(Math.cos(angle) * distance),
    dy: Math.round(Math.sin(angle) * distance - 30),
    r: i * 47,
  };
});

// M12 — gerbe de confettis au passage en CLOTUREE. Changer `trigger` rejoue l'animation.
// Rien n'est affiché si les animations sont désactivées.
export default function ConfettiBurst({
  trigger,
  className,
}: {
  trigger: number;
  className?: string;
}) {
  const anime = useMotionAllowed();
  if (!anime || trigger === 0) return null;
  return (
    <span
      key={trigger}
      aria-hidden="true"
      className={cn("pointer-events-none absolute size-0", className)}
    >
      {PARTICULES.map((p) => (
        <span
          key={p.id}
          className={cn(
            "absolute left-0 top-0 animate-burst",
            p.couleur,
            p.forme,
          )}
          style={
            {
              width: p.largeur,
              height: p.hauteur,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--r": `${p.r}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}
