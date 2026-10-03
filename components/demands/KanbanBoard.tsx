"use client";

import {
  type Announcements,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ChevronRight, Plus } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import ConfettiBurst from "@/components/ui/ConfettiBurst";
import PriorityBars from "@/components/ui/PriorityBars";
import SlaPill from "@/components/ui/SlaPill";
import { notifier } from "@/components/ui/Toast";
import { SPRING } from "@/lib/motion";
import { cn } from "@/lib/ui/cn";
import { reference } from "@/lib/ui/format";
import { type CodeStatut, libelleStatut, STATUTS } from "@/lib/ui/status";

export type CarteKanban = {
  id_demand: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  due_at: string | null;
  closed_at: string | null;
  id_assigned_agent: string | null;
  agent_full_name: string | null;
};

type Props = {
  demandes: CarteKanban[];
  // ADMIN / AGENT : glisser-déposer actif ; LECTURE : tableau en consultation
  peutModifier: boolean;
  maintenant: number;
};

const COLONNES: CodeStatut[] = ["NOUVELLE", "EN_COURS", "CLOTUREE"];

/* ---------- Carte ---------- */

function ContenuCarte({
  d,
  maintenant,
  saisie = false,
}: {
  d: CarteKanban;
  maintenant: number;
  saisie?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-fg-4">
          {reference(d.id_demand)}
        </span>
        <PriorityBars priority={d.priority} showLabel={false} />
      </div>
      {saisie ? (
        <p className="mb-2.5 mt-1.5 font-semibold leading-snug text-fg">
          {d.title}
        </p>
      ) : (
        <Link
          href={`/demands/${d.id_demand}`}
          className="mb-2.5 mt-1.5 block rounded-xs font-semibold leading-snug text-fg transition-colors hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          {d.title}
        </Link>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate rounded-[6px] bg-surface px-2 py-0.5 text-[11.5px] text-fg-2">
          {d.category}
        </span>
        <span className="flex items-center gap-2">
          <SlaPill
            compact
            statut={d.status}
            createdAt={d.created_at}
            dueAt={d.due_at}
            closedAt={d.closed_at}
            maintenant={maintenant}
          />
          {d.agent_full_name && d.id_assigned_agent ? (
            <Avatar
              id={d.id_assigned_agent}
              name={d.agent_full_name}
              size={24}
            />
          ) : (
            <span
              role="img"
              aria-label="Non assignée"
              className="inline-flex size-6 items-center justify-center rounded-full border border-dashed border-line-hover text-[11px] text-fg-4"
            >
              ?
            </span>
          )}
        </span>
      </div>
    </>
  );
}

function Carte({
  d,
  maintenant,
  draggable,
}: {
  d: CarteKanban;
  maintenant: number;
  draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: d.id_demand,
    disabled: !draggable,
    data: { demande: d },
  });
  return (
    <motion.div
      layout
      layoutId={`carte-${d.id_demand}`}
      transition={SPRING}
      ref={setNodeRef}
      {...(draggable ? listeners : {})}
      {...(draggable
        ? {
            ...attributes,
            "aria-roledescription": "carte déplaçable",
            "aria-label": `${d.title}, ${libelleStatut(d.status)}. Espace pour saisir.`,
          }
        : {})}
      // L'enveloppe porte l'animation de réordonnancement (transform inline de motion) ;
      // la carte intérieure porte le survol M05, pour que les deux ne s'écrasent pas.
      className={cn(
        "group rounded-[12px] outline-none",
        draggable && "cursor-grab touch-none active:cursor-grabbing",
      )}
    >
      <div
        className={cn(
          "rounded-[12px] border border-line-card bg-surface-2 px-3.5 py-3",
          "transition-[transform,box-shadow,border-color,opacity] duration-[280ms] ease-out",
          "group-hover:-translate-y-[3px] group-hover:border-line-hover group-hover:shadow-md",
          "group-focus-visible:border-accent-soft group-focus-visible:shadow-focus",
          isDragging && "opacity-40",
        )}
      >
        <ContenuCarte d={d} maintenant={maintenant} />
      </div>
    </motion.div>
  );
}

/* ---------- Colonne ---------- */

function Colonne({
  code,
  cartes,
  maintenant,
  draggable,
  enSaisie,
  gerbe,
  index,
}: {
  code: CodeStatut;
  cartes: CarteKanban[];
  maintenant: number;
  draggable: boolean;
  // Statut de la carte en cours de déplacement (null : aucune)
  enSaisie: string | null;
  gerbe: number;
  index: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: code });
  const cible = enSaisie !== null && enSaisie !== code;
  return (
    <section
      ref={setNodeRef}
      aria-label={`${STATUTS[code].label}, ${cartes.length} demande${cartes.length > 1 ? "s" : ""}`}
      className={cn(
        "relative flex min-h-[320px] w-[280px] shrink-0 animate-rise flex-col rounded-md border bg-surface-inset p-3 transition-colors duration-200 lg:w-auto lg:min-w-0 lg:flex-1",
        isOver && cible ? "border-accent-fg/70" : "border-line",
      )}
      style={{ animationDelay: `${200 + index * 90}ms` }}
    >
      <div className="flex items-center gap-2 px-1 pb-3 pt-1">
        <span
          aria-hidden="true"
          className={cn("size-[9px] rounded-[3px]", STATUTS[code].point)}
        />
        <h3 className="text-[13.5px] font-semibold">{STATUTS[code].label}</h3>
        <span className="text-xs tabular-nums text-fg-3">{cartes.length}</span>
        <span className="flex-1" />
        {code === "NOUVELLE" && draggable && (
          <Link
            href="/demands/new"
            aria-label="Nouvelle demande"
            className="inline-flex size-7 items-center justify-center rounded-[7px] text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            <Plus
              aria-hidden="true"
              strokeWidth={2.2}
              className="size-[15px]"
            />
          </Link>
        )}
        {code === "CLOTUREE" && (
          <ConfettiBurst trigger={gerbe} className="right-10 top-4" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {cartes.map((d) => (
          <Carte
            key={d.id_demand}
            d={d}
            maintenant={maintenant}
            draggable={draggable}
          />
        ))}
        {cible && (
          <div
            className={cn(
              "flex h-[92px] items-center justify-center rounded-[12px] border-[1.5px] border-dashed px-3 text-center text-[12.5px] font-medium text-accent-fg-2",
              isOver ? "animate-drop" : "border-accent-fg/35",
            )}
          >
            Déposer ici pour passer « {STATUTS[code].label} »
          </div>
        )}
        {cartes.length === 0 && !cible && (
          <p className="px-1 py-6 text-center text-[12.5px] text-fg-4">
            Aucune demande
          </p>
        )}
      </div>
    </section>
  );
}

/* ---------- Tableau ---------- */

// Kanban (F3, M13) : glisser une carte d'une colonne à l'autre change son statut
export default function KanbanBoard({
  demandes,
  peutModifier,
  maintenant,
}: Props) {
  const router = useRouter();
  // Statuts modifiés localement (mise à jour optimiste)
  const [locaux, setLocaux] = useState<Record<string, string>>({});
  const [active, setActive] = useState<CarteKanban | null>(null);
  const [gerbe, setGerbe] = useState(0);
  const [annuleesOuvertes, setAnnuleesOuvertes] = useState(false);

  const sensors = useSensors(
    // 6 px avant de saisir : un simple clic ouvre la fiche
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const cartes = useMemo(
    () =>
      demandes.map((d) =>
        locaux[d.id_demand] ? { ...d, status: locaux[d.id_demand] } : d,
      ),
    [demandes, locaux],
  );
  const parStatut = (code: string) => cartes.filter((d) => d.status === code);
  const annulees = parStatut("ANNULEE");

  async function deplacer(d: CarteKanban, vers: CodeStatut) {
    const depuis = d.status;
    if (depuis === vers) return;
    setLocaux((l) => ({ ...l, [d.id_demand]: vers }));
    try {
      const res = await fetch(`/api/demands/${d.id_demand}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: vers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Le statut n’a pas pu être modifié.");
      }
      if (vers === "CLOTUREE") setGerbe((n) => n + 1);
      notifier({
        titre: "Statut mis à jour",
        description: `« ${d.title} » : ${libelleStatut(depuis)} → ${libelleStatut(vers)}`,
        ton: "succes",
        action: {
          label: "Annuler",
          onClick: () => deplacer({ ...d, status: vers }, depuis as CodeStatut),
        },
      });
      router.refresh();
    } catch (e) {
      // Retour arrière animé : la carte revient dans sa colonne (layout)
      setLocaux((l) => ({ ...l, [d.id_demand]: depuis }));
      notifier({
        titre: "Déplacement impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    }
  }

  const surDebut = (e: DragStartEvent) =>
    setActive((e.active.data.current?.demande as CarteKanban) ?? null);

  const surFin = (e: DragEndEvent) => {
    const d = e.active.data.current?.demande as CarteKanban | undefined;
    setActive(null);
    if (!d || !e.over) return;
    const courant = locaux[d.id_demand] ?? d.status;
    deplacer({ ...d, status: courant }, e.over.id as CodeStatut);
  };

  const nomColonne = (id: unknown) =>
    typeof id === "string" && id in STATUTS
      ? STATUTS[id as CodeStatut].label
      : "";
  const titre = (id: unknown) =>
    cartes.find((d) => d.id_demand === id)?.title ?? "la demande";

  // Annonces en français pour les lecteurs d'écran
  const annonces: Announcements = {
    onDragStart: ({ active: a }) =>
      `« ${titre(a.id)} » saisie. Flèches pour choisir une colonne, Espace pour déposer, Échap pour annuler.`,
    onDragOver: ({ active: a, over }) =>
      over
        ? `« ${titre(a.id)} » au-dessus de la colonne ${nomColonne(over.id)}.`
        : `« ${titre(a.id)} » hors des colonnes.`,
    onDragEnd: ({ active: a, over }) =>
      over
        ? `« ${titre(a.id)} » déposée dans ${nomColonne(over.id)}.`
        : `« ${titre(a.id)} » relâchée, statut inchangé.`,
    onDragCancel: ({ active: a }) =>
      `Déplacement de « ${titre(a.id)} » annulé.`,
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={surDebut}
      onDragEnd={surFin}
      onDragCancel={() => setActive(null)}
      accessibility={{
        announcements: annonces,
        screenReaderInstructions: {
          draggable:
            "Pour déplacer une carte, appuyez sur Espace, utilisez les flèches pour changer de colonne, puis Espace pour déposer ou Échap pour annuler.",
        },
      }}
    >
      <LayoutGroup>
        <section
          aria-label="Tableau Kanban"
          className="-mx-4 flex items-start gap-4 overflow-x-auto overflow-y-hidden px-4 pb-3 pt-1 sm:mx-0 sm:px-0"
        >
          {COLONNES.map((code, i) => (
            <Colonne
              key={code}
              code={code}
              index={i}
              cartes={parStatut(code)}
              maintenant={maintenant}
              draggable={peutModifier}
              enSaisie={
                active ? (locaux[active.id_demand] ?? active.status) : null
              }
              gerbe={gerbe}
            />
          ))}

          {/* Annulées : colonne repliée par défaut */}
          {annuleesOuvertes ? (
            <Colonne
              code="ANNULEE"
              index={3}
              cartes={annulees}
              maintenant={maintenant}
              draggable={peutModifier}
              enSaisie={
                active ? (locaux[active.id_demand] ?? active.status) : null
              }
              gerbe={0}
            />
          ) : (
            <AnnuleesRepliees
              nombre={annulees.length}
              ouvrir={() => setAnnuleesOuvertes(true)}
              actif={!!active}
            />
          )}
        </section>
      </LayoutGroup>

      <DragOverlay
        dropAnimation={{ duration: 300, easing: "cubic-bezier(.22,1,.36,1)" }}
      >
        {active && (
          <div className="rotate-[-3deg] cursor-grabbing rounded-[12px] border border-accent-fg/80 bg-surface-2 px-3.5 py-3 shadow-[0_26px_50px_-20px_rgba(0,0,0,.85),0_0_0_4px_rgb(var(--accent)/.18)]">
            <ContenuCarte d={active} maintenant={maintenant} saisie />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

// Colonne « Annulées » repliée : bouton vertical, reste une zone de dépôt
function AnnuleesRepliees({
  nombre,
  ouvrir,
  actif,
}: {
  nombre: number;
  ouvrir: () => void;
  actif: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "ANNULEE" });
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={ouvrir}
      aria-label={`Afficher les demandes annulées (${nombre})`}
      className={cn(
        "flex min-h-[320px] w-14 shrink-0 animate-rise flex-col items-center gap-3 rounded-md border bg-surface-inset py-4 text-fg-3 transition-colors [animation-delay:470ms] hover:text-fg",
        isOver
          ? "animate-drop border-dashed"
          : actif
            ? "border-dashed border-accent-fg/35"
            : "border-line",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-[9px] rounded-[3px]", STATUTS.ANNULEE.point)}
      />
      <span className="text-xs tabular-nums">{nombre}</span>
      <span className="text-[12.5px] font-semibold [writing-mode:vertical-rl]">
        Annulées
      </span>
      <ChevronRight
        aria-hidden="true"
        strokeWidth={2}
        className="mt-auto size-4"
      />
    </button>
  );
}
