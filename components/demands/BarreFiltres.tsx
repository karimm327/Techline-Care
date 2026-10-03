"use client";

import { Bookmark, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import DialogueVue from "@/components/demands/DialogueVue";
import Checkbox from "@/components/ui/Checkbox";
import { useParametresUrl } from "@/lib/hooks/useParametresUrl";
import { cn } from "@/lib/ui/cn";
import { PRIORITES, STATUTS } from "@/lib/ui/status";
import { normaliserRequete } from "@/lib/ui/vues";

type Option = { value: string; label: string };

type Props = {
  categories: string[];
  agents: { id: string; nom: string }[];
};

type DefFiltre = { cle: string; titre: string; options: Option[] };

// Menu déroulant d'un filtre (flèche vers le bas, cases à cocher ; Échap / clic extérieur ferment)
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

  // Libellé du bouton : « Statut », « Statut · Nouvelle » ou « Statut · 2 »
  const resume =
    valeurs.length === 1
      ? (def.options.find((o) => o.value === valeurs[0])?.label ?? valeurs[0])
      : valeurs.length > 1
        ? String(valeurs.length)
        : null;

  return (
    <div ref={racine} className="relative">
      <button
        ref={bouton}
        type="button"
        aria-haspopup="true"
        aria-expanded={ouvert}
        aria-controls={idPanneau}
        onClick={() => setOuvert((v) => !v)}
        className={cn(
          "cible-tactile inline-flex h-9 max-w-[260px] items-center gap-1.5 rounded-[10px] border px-3 text-[13px] transition-colors duration-[180ms]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
          actif
            ? "border-accent-fg/40 bg-accent/15 font-medium text-accent-fg-2"
            : "border-line-strong/70 bg-surface text-fg-2 hover:border-line-hover hover:text-fg",
          ouvert && !actif && "border-line-hover text-fg",
        )}
      >
        <span className="truncate">
          {def.titre}
          {resume && (
            <>
              <span className="mx-1 text-fg-4">·</span>
              {resume}
            </>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2.2}
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-[250ms]",
            ouvert && "rotate-180",
          )}
        />
      </button>
      {ouvert && (
        <div
          id={idPanneau}
          className="absolute left-0 top-full z-overlay mt-2 min-w-[230px] animate-menu rounded-[12px] border border-line-strong bg-surface-2 shadow-lg"
        >
          <fieldset className="max-h-[300px] overflow-y-auto p-1.5">
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
                className="w-full rounded-[8px] px-2.5 hover:bg-surface-3"
              />
            ))}
          </fieldset>
          {actif && (
            <div className="border-t border-line px-1.5 py-1.5">
              <button
                type="button"
                onClick={() => onChange([])}
                className="cible-tactile flex h-9 w-full items-center gap-2 rounded-[8px] px-2.5 text-[13px] text-fg-2 transition-colors hover:bg-surface-3 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                <X aria-hidden="true" strokeWidth={2.2} className="size-3.5" />
                Retirer ce filtre
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Barre de filtres du tableau de bord : tout est dans l'URL (partageable, retour arrière)
export default function BarreFiltres({ categories, agents }: Props) {
  const { params, liste, modifier } = useParametresUrl();
  const [recherche, setRecherche] = useState(params.get("q") ?? "");
  const [dialogueVue, setDialogueVue] = useState(false);
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
    {
      cle: "sla",
      titre: "SLA",
      options: [
        { value: "late", label: "Dépassé" },
        { value: "warn", label: "Bientôt dépassé" },
        { value: "ok", label: "Dans les délais" },
      ],
    },
  ];

  const filtresActifs =
    defs.some((d) => liste(d.cle).length > 0) || !!recherche;

  return (
    <section
      aria-label="Filtres"
      className="relative z-sticky flex animate-rise flex-wrap items-center gap-2 [animation-delay:220ms]"
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
          className="cible-tactile h-9 w-full rounded-[10px] border border-line-strong/70 bg-surface pl-9 pr-3 text-[13px] text-fg placeholder:text-fg-4 transition-[border-color,box-shadow] hover:border-line-hover focus:border-accent-soft focus:shadow-focus focus:outline-none"
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
              sla: null,
              q: null,
            });
          }}
          className="cible-tactile h-9 rounded-[9px] px-3 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          Effacer les filtres
        </button>
      )}
      {filtresActifs && (
        <>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => setDialogueVue(true)}
            className="cible-tactile inline-flex h-9 items-center gap-[7px] rounded-[9px] px-3 text-[13px] font-semibold text-accent-fg transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            <Bookmark
              aria-hidden="true"
              strokeWidth={2}
              className="size-[15px]"
            />
            Enregistrer la vue
          </button>
          <DialogueVue
            open={dialogueVue}
            onClose={() => setDialogueVue(false)}
            requete={normaliserRequete(params.toString())}
          />
        </>
      )}
    </section>
  );
}
