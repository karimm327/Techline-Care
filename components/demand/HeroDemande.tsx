"use client";

import { ArrowLeft, ChevronDown, Link2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button, { classesBouton } from "@/components/ui/Button";
import ConfettiBurst from "@/components/ui/ConfettiBurst";
import Menu from "@/components/ui/Menu";
import StatusBadge from "@/components/ui/StatusBadge";
import StatusStepper from "@/components/ui/StatusStepper";
import { notifier } from "@/components/ui/Toast";
import { cn } from "@/lib/ui/cn";
import { reference } from "@/lib/ui/format";
import {
  type CodeStatut,
  estCodePriorite,
  libelleStatut,
  PRIORITES,
  STATUTS,
} from "@/lib/ui/status";

type Props = {
  id: string;
  titre: string;
  statut: string;
  priorite: string;
  categorie: string;
  // « Créée il y a 3 jours par Alice Martin »
  creation: string;
  // Droit de modifier (ADMIN / AGENT, demande non supprimée)
  peutAgir: boolean;
};

// Hero de la fiche : référence, titre, badges, actions, changement de statut (M12)
export default function HeroDemande({
  id,
  titre,
  statut: statutInitial,
  priorite,
  categorie,
  creation,
  peutAgir,
}: Props) {
  const router = useRouter();
  const [statut, setStatut] = useState(statutInitial);
  const [envoi, setEnvoi] = useState(false);
  const [gerbe, setGerbe] = useState(0);
  const p = estCodePriorite(priorite) ? PRIORITES[priorite] : null;

  async function changerStatut(nouveau: CodeStatut) {
    if (nouveau === statut || envoi) return;
    const precedent = statut;
    setStatut(nouveau); // mise à jour optimiste
    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nouveau }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Le statut n’a pas pu être modifié.");
      }
      if (nouveau === "CLOTUREE") setGerbe((n) => n + 1);
      notifier({
        titre: "Statut mis à jour",
        description: `${libelleStatut(precedent)} → ${libelleStatut(nouveau)}`,
        ton: "succes",
        action: {
          label: "Annuler",
          onClick: () => changerStatut(precedent as CodeStatut),
        },
      });
      router.refresh();
    } catch (e) {
      setStatut(precedent); // retour arrière
      notifier({
        titre: "Modification impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    } finally {
      setEnvoi(false);
    }
  }

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notifier({ titre: "Lien copié", ton: "info", duree: 3000 });
    } catch {
      notifier({ titre: "Copie impossible", ton: "erreur" });
    }
  }

  return (
    <section
      aria-labelledby="titre-demande"
      className="animate-rise rounded-lg border border-line bg-surface px-5 py-5 sm:px-6"
    >
      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <Link
          href="/demands"
          className={classesBouton({
            variant: "ghost",
            size: "sm",
            className: "h-[34px] pl-2 pr-3 text-fg-2",
          })}
        >
          <ArrowLeft aria-hidden="true" strokeWidth={2.2} className="size-4" />
          Demandes
        </Link>
        <span className="rounded-[7px] bg-accent/15 px-2 py-[3px] font-mono text-xs text-accent-fg">
          {reference(id)}
        </span>
        <button
          type="button"
          onClick={copierLien}
          className="cible-tactile inline-flex h-[30px] items-center gap-1.5 rounded-[8px] px-2.5 text-[12.5px] text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          <Link2 aria-hidden="true" strokeWidth={2} className="size-3.5" />
          Copier le lien
        </button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-[18px]">
        <div className="min-w-0 flex-[1_1_420px]">
          <h1
            id="titre-demande"
            className="break-words font-display text-[26px] font-semibold leading-tight tracking-[-.02em] sm:text-[30px]"
          >
            {titre}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={statut} />
            {p && (
              <span
                className={cn(
                  "inline-flex h-[26px] items-center gap-[7px] rounded-[7px] px-2.5 text-[12.5px] font-semibold",
                  p.badge,
                )}
              >
                {priorite === "HAUTE" && (
                  <span
                    aria-hidden="true"
                    className="size-[7px] animate-pulse rounded-full bg-prio-haute"
                  />
                )}
                Priorité {p.label.toLowerCase()}
              </span>
            )}
            <span className="inline-flex h-[26px] items-center rounded-[7px] bg-surface-2 px-2.5 text-[12.5px] text-fg-1">
              {categorie}
            </span>
            <span className="text-[12.5px] text-fg-3">{creation}</span>
          </div>
        </div>

        {peutAgir && (
          <div className="relative flex flex-wrap gap-2">
            <Link
              href={`/demands/${id}/edit`}
              className={classesBouton({ variant: "secondary" })}
            >
              <Pencil aria-hidden="true" strokeWidth={2} className="size-4" />
              Modifier
            </Link>
            <Menu
              label="Changer le statut"
              items={(Object.keys(STATUTS) as CodeStatut[]).map((code) => ({
                label: STATUTS[code].label,
                icon: (
                  <span
                    className={cn("size-2.5 rounded-full", STATUTS[code].point)}
                  />
                ),
                onSelect: () => changerStatut(code),
              }))}
              trigger={(props, ouvert) => (
                <Button {...props} loading={envoi} loadingLabel="Mise à jour…">
                  Changer le statut
                  <ChevronDown
                    aria-hidden="true"
                    strokeWidth={2.4}
                    className={cn(
                      "size-3.5 transition-transform duration-[250ms]",
                      ouvert && "rotate-180",
                    )}
                  />
                </Button>
              )}
            />
            <ConfettiBurst trigger={gerbe} className="right-[70px] top-5" />
          </div>
        )}
      </div>

      <div className="mt-[22px] border-t border-line pt-5">
        {statut === "ANNULEE" ? (
          <Alert tone="info" title="Demande annulée">
            Elle reste consultable mais ne suit plus le parcours de traitement.
          </Alert>
        ) : (
          <StatusStepper status={statut} />
        )}
      </div>
      {/* Annonce du changement de statut aux lecteurs d'écran */}
      <p aria-live="polite" className="sr-only">
        Statut : {libelleStatut(statut)}
      </p>
    </section>
  );
}
