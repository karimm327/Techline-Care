import { cn } from "@/lib/ui/cn";

// Feuille orientée vers la droite, origine à la tige
const FEUILLE = "M0 0 C8 -10 22 -12 31 -4 C22 5 8 6 0 0Z";

type Feuille = { x: number; y: number; angle: number; taille?: number };

// Feuilles le long des deux branches (position de la tige, angle, échelle)
const FEUILLES: Feuille[] = [
  { x: 74, y: 222, angle: 200, taille: 1.1 },
  { x: 92, y: 204, angle: -40 },
  { x: 128, y: 178, angle: 195 },
  { x: 150, y: 164, angle: -55, taille: 1.15 },
  { x: 236, y: 120, angle: 210 },
  { x: 258, y: 100, angle: -35, taille: 0.95 },
  { x: 282, y: 80, angle: 215, taille: 0.9 },
  { x: 298, y: 64, angle: -60, taille: 0.85 },
  { x: 352, y: 228, angle: 205 },
  { x: 368, y: 206, angle: -30, taille: 1.05 },
  { x: 392, y: 180, angle: 210, taille: 0.9 },
  { x: 410, y: 160, angle: -45, taille: 0.85 },
];

// Petites fleurs à cinq pétales
const FLEURS = [
  { x: 304, y: 56, r: 4.2 },
  { x: 168, y: 150, r: 3.4 },
  { x: 418, y: 150, r: 3.8 },
  { x: 60, y: 236, r: 3 },
];

function Fleur({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={Math.cos((a * Math.PI) / 180) * r}
          cy={Math.sin((a * Math.PI) / 180) * r}
          r={r * 0.8}
          className="fill-avatar-1/35 stroke-avatar-1/60"
          strokeWidth={0.8}
        />
      ))}
      <circle r={r * 0.55} className="fill-st-encours/80" />
    </g>
  );
}

// Décor de la bannière d'accueil : branches, feuilles, fleurs et un rouge-gorge posé.
// Couleurs issues des tokens : s'adapte au thème sombre (TechLine Care) comme au clair.
export default function DecorFeuillage({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 260"
      preserveAspectRatio="xMinYMax meet"
      className={cn("pointer-events-none", className)}
    >
      {/* Branches */}
      <g
        fill="none"
        strokeLinecap="round"
        className="stroke-success/50"
        strokeWidth={1.6}
      >
        <path d="M40 262 C80 214 140 172 200 142 C240 122 272 96 302 60" />
        <path d="M200 142 C214 128 222 112 224 96" strokeWidth={1.2} />
        <path d="M330 262 C350 226 380 190 430 146" />
      </g>

      {/* Feuilles */}
      {FEUILLES.map((f) => (
        <path
          key={`${f.x}-${f.y}`}
          d={FEUILLE}
          transform={`translate(${f.x} ${f.y}) rotate(${f.angle}) scale(${f.taille ?? 1})`}
          className="fill-success/10 stroke-success/50"
          strokeWidth={1.1}
          strokeLinejoin="round"
        />
      ))}
      <path
        d={FEUILLE}
        transform="translate(224 96) rotate(-80) scale(0.8)"
        className="fill-success/10 stroke-success/50"
        strokeWidth={1.1}
      />

      {FLEURS.map((f) => (
        <Fleur key={`${f.x}-${f.y}`} {...f} />
      ))}

      {/* Rouge-gorge posé sur la branche principale, tourné vers la gauche */}
      <g transform="translate(206 139)">
        <path
          d="M-3 -5 L-4 0 M2 -5 L2 0"
          className="stroke-fg-3"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <path d="M11 -13 L29 -5 L27 -11 L13 -18Z" className="fill-fg-3/80" />
        <ellipse
          cx="0"
          cy="-14"
          rx="15"
          ry="10"
          transform="rotate(-14 0 -14)"
          className="fill-fg-3/70"
        />
        <ellipse
          cx="-7"
          cy="-14"
          rx="8"
          ry="7"
          className="fill-prio-haute/75"
        />
        <path
          d="M-1 -19 C7 -21 13 -17 15 -11 C7 -11 1 -13 -1 -19Z"
          className="fill-fg-3"
        />
        <circle cx="-12" cy="-24" r="8" className="fill-fg-3/80" />
        <circle cx="-14" cy="-21" r="5" className="fill-prio-haute/75" />
        <path d="M-19 -26 L-26 -24 L-19 -22Z" className="fill-st-encours" />
        <circle cx="-14.5" cy="-26" r="1.5" className="fill-ink" />
        <circle cx="-14.9" cy="-26.4" r="0.5" className="fill-fg" />
      </g>
    </svg>
  );
}
