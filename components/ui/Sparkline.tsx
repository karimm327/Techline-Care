"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";

type Props = {
  data: number[];
  // Classe de couleur du trait (ex. « text-accent-fg ») : le tracé utilise currentColor
  className?: string;
  width?: number;
  height?: number;
};

// Chemin d'une courbe dans un cadre width × height (marge de 2 px)
export function cheminSparkline(data: number[], width: number, height: number) {
  if (data.length === 0) return "";
  const max = Math.max(...data);
  const min = Math.min(...data);
  const etendue = max - min || 1;
  const pasX = data.length > 1 ? (width - 4) / (data.length - 1) : 0;
  return data
    .map((v, i) => {
      const x = 2 + i * pasX;
      const y = height - 2 - ((v - min) / etendue) * (height - 4);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

// M02 — courbe tracée progressivement (longueur réelle mesurée, puis animate-draw)
export default function Sparkline({
  data,
  className,
  width = 104,
  height = 36,
}: Props) {
  const trace = useRef<SVGPathElement>(null);
  const [longueur, setLongueur] = useState<number | null>(null);
  const d = cheminSparkline(data, width, height);

  useLayoutEffect(() => {
    if (trace.current) setLongueur(trace.current.getTotalLength());
  }, []);

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn("shrink-0", className)}
    >
      <path
        ref={trace}
        d={d}
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={longueur !== null ? "animate-draw" : "opacity-0"}
        style={
          longueur !== null
            ? { strokeDasharray: longueur, strokeDashoffset: longueur }
            : undefined
        }
      />
    </svg>
  );
}
