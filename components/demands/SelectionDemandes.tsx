"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Menu, { type ProprietesDeclencheur } from "@/components/ui/Menu";
import { notifier } from "@/components/ui/Toast";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import { pluriel } from "@/lib/ui/format";
import {
  type CodePriorite,
  type CodeStatut,
  PRIORITES,
  STATUTS,
} from "@/lib/ui/status";

type ContexteSelection = {
  ids: string[];
  selection: Set<string>;
  basculer: (id: string) => void;
  toutBasculer: () => void;
  vider: () => void;
};

const Contexte = createContext<ContexteSelection | null>(null);

function useSelection() {
  const c = useContext(Contexte);
  if (!c) throw new Error("SelectionDemandes manquant");
  return c;
}

// Sélection des lignes de la page courante (F6) ; vidée quand la page change
export function SelectionDemandes({
  ids,
  children,
}: {
  ids: string[];
  children: ReactNode;
}) {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const cle = ids.join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: nouvelle page de résultats = sélection vide
  useEffect(() => setSelection(new Set()), [cle]);

  const valeur = useMemo<ContexteSelection>(
    () => ({
      ids,
      selection,
      basculer: (id) =>
        setSelection((s) => {
          const n = new Set(s);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        }),
      toutBasculer: () =>
        setSelection((s) => (s.size === ids.length ? new Set() : new Set(ids))),
      vider: () => setSelection(new Set()),
    }),
    [ids, selection],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

const classeCase =
  "size-[17px] cursor-pointer rounded-[4px] accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft";

export function CaseSelection({ id, titre }: { id: string; titre: string }) {
  const { selection, basculer } = useSelection();
  return (
    <input
      type="checkbox"
      checked={selection.has(id)}
      onChange={() => basculer(id)}
      aria-label={`Sélectionner « ${titre} »`}
      className={classeCase}
    />
  );
}

export function CaseToutes() {
  const { ids, selection, toutBasculer } = useSelection();
  const ref = useRef<HTMLInputElement>(null);
  const toutes = ids.length > 0 && selection.size === ids.length;
  // État indéterminé : une partie seulement est cochée
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = selection.size > 0 && !toutes;
  }, [selection.size, toutes]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={toutes}
      onChange={toutBasculer}
      aria-label="Sélectionner toutes les demandes de la page"
      className={classeCase}
    />
  );
}

type Precedent = {
  id: string;
  status: string;
  priority: string;
  agentId: string | null;
};

const classeDeclencheur =
  "inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] text-fg transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft";

// Barre d'actions groupées (M15) : au-dessus du tableau, fixée en bas d'écran sur mobile
export function BarreActionsGroupees({
  agents,
}: {
  agents: { id: string; nom: string }[];
}) {
  const router = useRouter();
  const { selection, vider } = useSelection();
  const [envoi, setEnvoi] = useState(false);
  const n = selection.size;

  async function appliquer(
    corps: Record<string, unknown>,
    libelle: string,
  ): Promise<void> {
    if (envoi) return;
    setEnvoi(true);
    try {
      const res = await fetch("/api/demands/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corps),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Action impossible.");
      const precedent = (data.precedent ?? []) as Precedent[];
      vider();
      router.refresh();
      notifier({
        titre:
          data.modifiees > 0
            ? `${pluriel(data.modifiees, "demande mise à jour", "demandes mises à jour")}`
            : "Aucune modification",
        description: data.modifiees > 0 ? libelle : undefined,
        ton: data.modifiees > 0 ? "succes" : "info",
        action:
          precedent.length > 0 && !("restaurer" in corps)
            ? {
                label: "Annuler",
                onClick: () =>
                  appliquer({ restaurer: precedent }, "Modifications annulées"),
              }
            : undefined,
      });
    } catch (e) {
      notifier({
        titre: "Action groupée impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    } finally {
      setEnvoi(false);
    }
  }

  const ids = [...selection];
  const declencheur =
    (texte: string) => (props: ProprietesDeclencheur, ouvert: boolean) => (
      <button
        type="button"
        {...props}
        disabled={envoi}
        className={classeDeclencheur}
      >
        {texte}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2.2}
          className={cn(
            "size-3.5 transition-transform duration-[250ms]",
            ouvert && "rotate-180",
          )}
        />
      </button>
    );

  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.section
          aria-label="Actions groupées"
          initial={{ opacity: 0, y: -12 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { duration: 0.32, ease: EASE_OUT },
          }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
          className={cn(
            "flex flex-wrap items-center gap-2.5 border-b border-accent-fg/30 bg-accent/15 px-[18px] py-2.5",
            // Mobile : barre flottante en bas d'écran
            "max-md:fixed max-md:inset-x-3 max-md:bottom-3 max-md:z-sticky max-md:rounded-[14px] max-md:border max-md:bg-surface-2 max-md:shadow-lg",
          )}
        >
          <span
            className="text-[13px] font-semibold text-accent-fg-2"
            aria-live="polite"
          >
            {pluriel(n, "sélectionnée", "sélectionnées")}
          </span>
          <span aria-hidden="true" className="h-[18px] w-px bg-accent-fg/35" />
          <Menu
            label="Assigner"
            items={[
              ...agents.map((a) => ({
                label: a.nom,
                onSelect: () =>
                  appliquer({ ids, agentId: a.id }, `Assignées à ${a.nom}`),
              })),
              { type: "separator" as const },
              {
                label: "Retirer l’agent",
                onSelect: () =>
                  appliquer({ ids, agentId: null }, "Agent retiré"),
              },
            ]}
            trigger={declencheur("Assigner…")}
          />
          <Menu
            label="Changer le statut"
            items={(Object.keys(STATUTS) as CodeStatut[]).map((code) => ({
              label: STATUTS[code].label,
              icon: (
                <span
                  className={cn("size-2.5 rounded-full", STATUTS[code].point)}
                />
              ),
              onSelect: () =>
                appliquer(
                  { ids, status: code },
                  `Statut : ${STATUTS[code].label}`,
                ),
            }))}
            trigger={declencheur("Changer le statut…")}
          />
          <Menu
            label="Priorité"
            items={(Object.keys(PRIORITES) as CodePriorite[]).map((code) => ({
              label: PRIORITES[code].label,
              icon: (
                <span
                  className={cn("size-2.5 rounded-full", PRIORITES[code].barre)}
                />
              ),
              onSelect: () =>
                appliquer(
                  { ids, priority: code },
                  `Priorité : ${PRIORITES[code].label}`,
                ),
            }))}
            trigger={declencheur("Priorité…")}
          />
          <span className="flex-1" />
          <button
            type="button"
            onClick={vider}
            className={cn(classeDeclencheur, "text-fg-2")}
          >
            Annuler
          </button>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
