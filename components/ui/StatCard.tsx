import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import Card from "./Card";
import CountUp from "./CountUp";
import Sparkline from "./Sparkline";

export type TonStat = "accent" | "late" | "done" | "warn";

const TONS: Record<TonStat, { chip: string; trait: string }> = {
  accent: { chip: "bg-accent/20 text-accent-fg-2", trait: "text-accent-fg" },
  late: {
    chip: "bg-prio-haute/15 text-prio-haute-fg",
    trait: "text-prio-haute",
  },
  done: { chip: "bg-success/15 text-success-fg", trait: "text-success" },
  warn: {
    chip: "bg-st-encours/15 text-st-encours-fg",
    trait: "text-st-encours",
  },
};

type Props = {
  label: string;
  // null : aucune donnée, la carte affiche « — »
  value: number | null;
  decimals?: number;
  unit?: string;
  // Pastille à droite du libellé (ex. « +2 aujourd'hui »)
  trend?: string;
  tone?: TonStat;
  spark?: number[];
  hint?: ReactNode;
  // Rang pour la cascade d'entrée (M01)
  index?: number;
  className?: string;
};

// Carte KPI : libellé, valeur animée (M02), sparkline, indication
export default function StatCard({
  label,
  value,
  decimals = 0,
  unit,
  trend,
  tone = "accent",
  spark,
  hint,
  index = 0,
  className,
}: Props) {
  const t = TONS[tone];
  return (
    <Card
      as="article"
      interactive
      className={cn(
        "animate-rise px-5 py-[18px] sm:px-5 sm:py-[18px]",
        className,
      )}
      style={{ animationDelay: `${80 + index * 70}ms` }}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[13px] font-medium text-fg-2">{label}</h3>
        {trend && (
          <span
            className={cn(
              "whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-semibold",
              t.chip,
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <p className="font-display text-kpi tabular-nums">
          {value === null ? (
            <span className="text-fg-4">—</span>
          ) : (
            <CountUp value={value} decimals={decimals} />
          )}
          {unit && value !== null && (
            <span className="ml-1 text-base font-medium text-fg-3">{unit}</span>
          )}
        </p>
        {spark && spark.length > 1 && (
          <Sparkline data={spark} className={t.trait} />
        )}
      </div>
      {hint && <p className="mt-2.5 text-[12.5px] text-fg-3">{hint}</p>}
    </Card>
  );
}
