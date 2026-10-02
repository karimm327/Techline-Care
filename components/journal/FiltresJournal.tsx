"use client";

import { CalendarDays, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import { useParametresUrl } from "@/lib/hooks/useParametresUrl";
import { cn } from "@/lib/ui/cn";

const dateFr = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

// Bouton « période » (popover avec deux dates) — en-tête du journal
export function FiltrePeriode() {
  const { params, modifier } = useParametresUrl();
  const [ouvert, setOuvert] = useState(false);
  const [du, setDu] = useState(params.get("du") ?? "");
  const [au, setAu] = useState(params.get("au") ?? "");
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    racine.current?.querySelector<HTMLInputElement>("input")?.focus();
    const dehors = (e: MouseEvent) => {
      if (!racine.current?.contains(e.target as Node)) setOuvert(false);
    };
    const echap = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOuvert(false);
      bouton.current?.focus();
    };
    document.addEventListener("mousedown", dehors);
    document.addEventListener("keydown", echap);
    return () => {
      document.removeEventListener("mousedown", dehors);
      document.removeEventListener("keydown", echap);
    };
  }, [ouvert]);

  const actuelDu = params.get("du");
  const actuelAu = params.get("au");
  const libelle =
    actuelDu || actuelAu
      ? `${actuelDu ? dateFr(actuelDu) : "…"} – ${actuelAu ? dateFr(actuelAu) : "aujourd’hui"}`
      : "Toute la période";

  const champ =
    "h-10 w-full rounded-[10px] border border-line-field bg-bg px-3 text-[13.5px] text-fg [color-scheme:dark] hover:border-line-hover focus:border-accent-soft focus:shadow-focus focus:outline-none";

  return (
    <div ref={racine} className="relative">
      <Button
        ref={bouton}
        variant="secondary"
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        onClick={() => setOuvert((v) => !v)}
        icon={
          <CalendarDays
            aria-hidden="true"
            strokeWidth={1.9}
            className="size-4"
          />
        }
      >
        {libelle}
      </Button>
      {ouvert && (
        <div
          role="dialog"
          aria-label="Choisir la période"
          className="absolute right-0 top-full z-overlay mt-2 w-[280px] animate-menu rounded-[14px] border border-line-strong bg-surface-2 p-4 shadow-lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              modifier({ du: du || null, au: au || null, n: null });
              setOuvert(false);
            }}
            className="flex flex-col gap-3"
          >
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-fg-1">
              Du
              <input
                type="date"
                value={du}
                max={au || undefined}
                onChange={(e) => setDu(e.target.value)}
                className={champ}
              />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-fg-1">
              Au
              <input
                type="date"
                value={au}
                min={du || undefined}
                onChange={(e) => setAu(e.target.value)}
                className={champ}
              />
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDu("");
                  setAu("");
                  modifier({ du: null, au: null, n: null });
                  setOuvert(false);
                }}
              >
                Effacer
              </Button>
              <Button type="submit" size="sm">
                Appliquer
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Recherche (acteur, titre) — 300 ms après la dernière frappe
export function RechercheJournal({ total }: { total: number }) {
  const { params, modifier } = useParametresUrl();
  const [q, setQ] = useState(params.get("q") ?? "");
  const derniere = useRef(params.get("q") ?? "");

  useEffect(() => {
    if (q === derniere.current) return;
    const minuteur = window.setTimeout(() => {
      derniere.current = q;
      modifier({ q: q.trim() || null, n: null });
    }, 300);
    return () => window.clearTimeout(minuteur);
  }, [q, modifier]);

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line py-3.5">
      <label
        className={cn(
          "flex h-10 flex-[1_1_260px] items-center gap-2.5 rounded-[10px] border border-line-field bg-bg px-3 text-fg-3",
          "transition-[border-color,box-shadow] focus-within:border-accent-soft focus-within:shadow-focus hover:border-line-hover",
        )}
      >
        <Search
          aria-hidden="true"
          strokeWidth={2}
          className="size-4 shrink-0"
        />
        <span className="sr-only">Rechercher un acteur ou une demande</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un acteur, une demande…"
          className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-fg placeholder:text-fg-4 focus:outline-none"
        />
      </label>
      <span className="text-[12.5px] tabular-nums text-fg-3" aria-live="polite">
        {total.toLocaleString("fr-FR")} événement{total > 1 ? "s" : ""}
      </span>
    </div>
  );
}
