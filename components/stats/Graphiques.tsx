"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useCouleursTokens } from "@/lib/hooks/useCouleursTokens";
import { useMotionAllowed } from "@/lib/motion";

const jourCourt = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

// Info-bulle aux couleurs des tokens
function Bulle({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line-strong bg-surface-2 px-3 py-2 text-[12.5px] shadow-lg">
      {label && (
        <p className="mb-1 font-semibold text-fg">{jourCourt(label)}</p>
      )}
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-fg-2">
          <span
            className="size-2 rounded-full"
            style={{ background: p.color }}
          />
          {p.name} : <b className="text-fg">{p.value}</b>
        </p>
      ))}
    </div>
  );
}

// Créées vs clôturées par jour (aire sous « créées » à 12 %, tracé 1,5 s)
export function CourbeCreesCloturees({
  serie,
}: {
  serie: { jour: string; crees: number; cloturees: number }[];
}) {
  const c = useCouleursTokens();
  const anime = useMotionAllowed();
  if (!c) return <div className="h-[240px]" />;
  return (
    <div
      className="h-[240px]"
      role="img"
      aria-label="Courbes des demandes créées et clôturées par jour"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={serie}
          margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
        >
          <defs>
            <linearGradient id="aire-crees" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={c["accent-soft"]}
                stopOpacity={0.22}
              />
              <stop
                offset="100%"
                stopColor={c["accent-soft"]}
                stopOpacity={0.02}
              />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c["line-soft"]} vertical={false} />
          <XAxis
            dataKey="jour"
            tickFormatter={jourCourt}
            tick={{ fill: c["fg-3"], fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: c["fg-3"], fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<Bulle />} cursor={{ stroke: c["line-strong"] }} />
          <Area
            type="monotone"
            dataKey="crees"
            name="Créées"
            stroke={c["accent-soft"]}
            strokeWidth={2.6}
            fill="url(#aire-crees)"
            isAnimationActive={anime}
            animationDuration={1500}
          />
          <Area
            type="monotone"
            dataKey="cloturees"
            name="Clôturées"
            stroke={c["st-cloturee"]}
            strokeWidth={2.6}
            fill="transparent"
            isAnimationActive={anime}
            animationDuration={1500}
            animationBegin={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const PALETTE = [
  "avatar-1",
  "accent-soft",
  "st-cloturee",
  "avatar-3",
  "avatar-2",
  "avatar-6",
] as const;

// Répartition par catégorie (donut, total au centre)
export function DonutCategories({
  categories,
}: {
  categories: { label: string; n: number }[];
}) {
  const c = useCouleursTokens();
  const anime = useMotionAllowed();
  const total = categories.reduce((a, x) => a + x.n, 0);
  const avecValeur = categories.filter((x) => x.n > 0);
  if (!c) return <div className="h-[140px]" />;
  return (
    <div className="flex flex-wrap items-center gap-[18px]">
      <div
        className="relative size-[140px]"
        role="img"
        aria-label={`Répartition par catégorie, ${total} demandes`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={
                avecValeur.length ? avecValeur : [{ label: "Aucune", n: 1 }]
              }
              dataKey="n"
              nameKey="label"
              innerRadius={45}
              outerRadius={63}
              paddingAngle={avecValeur.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={anime}
              animationDuration={900}
            >
              {(avecValeur.length
                ? avecValeur
                : [{ label: "Aucune", n: 1 }]
              ).map((x, i) => (
                <Cell
                  key={x.label}
                  fill={
                    avecValeur.length
                      ? c[PALETTE[i % PALETTE.length]]
                      : c["line-soft"]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] font-semibold leading-none">
            {total}
          </span>
          <span className="text-[11px] text-fg-3">demandes</span>
        </div>
      </div>
      <ul className="flex min-w-[140px] flex-1 flex-col gap-2.5">
        {categories.map((x) => {
          const i = avecValeur.findIndex((v) => v.label === x.label);
          return (
            <li key={x.label} className="flex items-center gap-2.5 text-[13px]">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-[3px]"
                style={{
                  background:
                    i >= 0 ? c[PALETTE[i % PALETTE.length]] : c["line-soft"],
                }}
              />
              <span className="flex-1 text-fg-1">{x.label}</span>
              <span className="tabular-nums text-fg-3">{x.n}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
