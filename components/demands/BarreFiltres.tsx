"use client";

import { Plus, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import { useParametresUrl } from "@/lib/hooks/useParametresUrl";
import { cn } from "@/lib/ui/cn";
import { PRIORITES, STATUTS } from "@/lib/ui/status";

type Option = { value: string; label: string };

type Props = {
  categories: string[];
  agents: { id: string; nom: string }[];
};

type DefFiltre = { cle: string; titre: string; options: Option[] };

// Popover de sélection multiple d'un filtre (cases à cocher, Échap / clic extérieur ferment)
function ChipFiltre({
  def,
  valeurs,
  onChange,
}: {
  def: DefFiltre;
  valeurs: string[];
  onChange: (v: string[]) => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const racine = useRef<HTMLDivElement>(null);
  const bouton = useRef<HTMLButtonElement>(null);
  const idPanneau = useId();
  const actif = valeurs.length > 0;

  useEffect(() => {
    if (!ouvert) return;
    racine.current
      ?.querySelector<HTMLInputElement>("input[type=checkbox]")
      ?.focus();
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

  const libelles = valeurs
    .map((v) => def.options.find((o) => o.value === v)?.label ?? v)
    .join(", ");

  return (
    <div ref={racine} className="relative">
      <div
        className={cn(
          "cible-tactile flex h-9 items-center rounded-full text-[13px] transition-colors duration-[180ms]",
          actif
            ? "border border-accent-fg/45 bg-accent/15 font-medium text-accent-fg-2"
            : "border border-dashed border-line-strong text-fg-2 hover:bg-surface-2 hover:text-fg",
        )}
      >
        <button
          ref={bouton}
          type="button"
          aria-expanded={ouvert}
          aria-controls={idPanneau}
          onClick={() => setOuvert((v) => !v)}
          className="flex h-full max-w-[280px] items-center gap-1 truncate rounded-full px-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          {actif ? (
            <span className="truncate">
              {def.titre} : {libelles}
            </span>
          ) : (
            <>
              <Plus aria-hidden="true" strokeWidth={2.2} className="size-3.5" />
              {def.titre}
            </>
          )}
        </button>
        {actif && (
          <button
            type="button"
            aria-label={`Retirer le filtre ${def.titre}`}
            onClick={() => onChange([])}
            className="-ml-1 mr-1 flex size-7 items-center justify-center rounded-full hover:bg-accent/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            <X aria-hidden="true" strokeWidth={2.4} className="size-3.5" />
          </button>
        )}
      </div>
      {ouvert && (
        <fieldset
          id={idPanneau}
          className="absolute left-0 top-full z-overlay mt-2 max-h-[320px] min-w-[220px] animate-menu overflow-y-auto rounded-[14px] border border-line-strong bg-surface-2 p-2 shadow-lg"
        >
          <legend className="sr-only">{def.titre}</legend>
          {def.options.map((o) => (
            <Checkbox
              key={o.value}
              label={o.label}
              checked={valeurs.includes(o.value)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...valeurs, o.value]
                    : valeurs.filter((v) => v !== o.value),
                )
              }
              className="w-full rounded-[9px] px-2 hover:bg-surface-3"
            />
          ))}
        </fieldset>
      )}
    </div>
  );
}

// Barre de filtres du tableau de bord : tout est dans l'URL (partageable, retour arrière)
export default function BarreFiltres({ categories, agents }: Props) {
  const { params, liste, modifier } = useParametresUrl();
  const [recherche, setRecherche] = useState(params.get("q") ?? "");
  const derniereQ = useRef(params.get("q") ?? "");

  // Recherche : mise à jour de l'URL 300 ms après la dernière frappe
  useEffect(() => {
    if (recherche === derniereQ.current) return;
    const minuteur = window.setTimeout(() => {
      derniereQ.current = recherche;
      modifier({ q: recherche.trim() || null });
    }, 300);
    return () => window.clearTimeout(minuteur);
  }, [recherche, modifier]);

  const defs: DefFiltre[] = [
    {
      cle: "statut",
      titre: "Statut",
      options: Object.entries(STATUTS).map(([value, s]) => ({
        value,
        label: s.label,
      })),
    },
    {
      cle: "priorite",
      titre: "Priorité",
      options: Object.entries(PRIORITES).map(([value, p]) => ({
        value,
        label: p.label,
      })),
    },
    {
      cle: "categorie",
      titre: "Catégorie",
      options: categories.map((c) => ({ value: c, label: c })),
    },
    {
      cle: "agent",
      titre: "Agent",
      options: [
        { value: "aucun", label: "Non assignée" },
        ...agents.map((a) => ({ value: a.id, label: a.nom })),
      ],
    },
  ];

  const filtresActifs =
    defs.some((d) => liste(d.cle).length > 0) || !!recherche;

  return (
    <section
      aria-label="Filtres"
      className="flex animate-rise flex-wrap items-center gap-2 [animation-delay:220ms]"
    >
      <label className="relative flex min-w-[200px] flex-1 basis-[220px] sm:max-w-[300px]">
        <span className="sr-only">Rechercher par titre ou référence</span>
        <Search
          aria-hidden="true"
          strokeWidth={2}
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-3"
        />
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Titre ou #référence"
          className="cible-tactile h-9 w-full rounded-full border border-line-strong/70 bg-surface pl-9 pr-3 text-[13px] text-fg placeholder:text-fg-4 transition-[border-color,box-shadow] hover:border-line-hover focus:border-accent-soft focus:shadow-focus focus:outline-none"
        />
      </label>
      {defs.map((def) => (
        <ChipFiltre
          key={def.cle}
          def={def}
          valeurs={liste(def.cle)}
          onChange={(v) => modifier({ [def.cle]: v })}
        />
      ))}
      {filtresActifs && (
        <button
          type="button"
          onClick={() => {
            setRecherche("");
            derniereQ.current = "";
            modifier({
              statut: null,
              priorite: null,
              categorie: null,
              agent: null,
              q: null,
            });
          }}
          className="cible-tactile h-9 rounded-[9px] px-3 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          Effacer les filtres
        </button>
      )}
    </section>
  );
}
