"use client";

import { Bell, BellOff, Link2, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { notifier } from "@/components/ui/Toast";
import type { Abonne, DemandeLiee } from "@/lib/db/queries/suivi.queries";
import { cn } from "@/lib/ui/cn";
import { reference } from "@/lib/ui/format";
import { estCodeStatut, STATUTS } from "@/lib/ui/status";

// Abonnés d'une demande (F11) : pile d'avatars + « Suivre » / « Ne plus suivre »
export function AbonnesDemande({
  demandId,
  initiaux,
  moiId,
  actif,
}: {
  demandId: string;
  initiaux: Abonne[];
  moiId: string;
  // Demande non supprimée
  actif: boolean;
}) {
  const [abonnes, setAbonnes] = useState(initiaux);
  const [envoi, setEnvoi] = useState(false);
  const moi = abonnes.find((a) => a.id === moiId);
  // Créateur ou agent : abonné d'office, pas de bouton
  const automatique = !!moi && !moi.explicite;

  async function basculer() {
    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${demandId}/watchers`, {
        method: moi ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!res.ok) throw new Error();
      setAbonnes(await res.json());
      notifier({
        titre: moi
          ? "Vous ne suivez plus cette demande"
          : "Vous suivez cette demande",
        description: moi
          ? undefined
          : "Vous serez notifié des commentaires et changements de statut.",
        ton: "info",
        duree: 4000,
      });
    } catch {
      notifier({ titre: "Action impossible", ton: "erreur" });
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div>
      <p className="mb-2 mt-3.5 text-eyebrow uppercase text-fg-4">Abonnés</p>
      <div className="flex flex-wrap items-center gap-2">
        {abonnes.length === 0 && (
          <span className="text-[13px] text-fg-3">
            Personne pour l’instant.
          </span>
        )}
        <span className="flex">
          {abonnes.slice(0, 6).map((a, i) => (
            <Avatar
              key={a.id}
              id={a.id}
              name={a.nom}
              size={28}
              className={cn("border-2 border-surface", i > 0 && "-ml-2")}
            />
          ))}
          {abonnes.length > 6 && (
            <span className="-ml-2 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-surface-3 text-[10.5px] font-semibold">
              +{abonnes.length - 6}
            </span>
          )}
        </span>
        {actif && !automatique && (
          <Button
            variant="ghost"
            size="sm"
            onClick={basculer}
            loading={envoi}
            className="h-7 rounded-full border border-dashed border-line-hover px-2.5 text-xs text-fg-2"
            icon={
              moi ? (
                <BellOff
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-3.5"
                />
              ) : (
                <Bell aria-hidden="true" strokeWidth={2} className="size-3.5" />
              )
            }
          >
            {moi ? "Ne plus suivre" : "Suivre"}
          </Button>
        )}
      </div>
    </div>
  );
}

// Demandes liées (F11) : liste, ajout par référence (#7B20E1AA), retrait
export function DemandesLiees({
  demandId,
  initiales,
  peutModifier,
}: {
  demandId: string;
  initiales: DemandeLiee[];
  peutModifier: boolean;
}) {
  const [liees, setLiees] = useState(initiales);
  const [saisie, setSaisie] = useState("");
  const [doublon, setDoublon] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  async function appel(methode: "POST" | "DELETE", corps: object) {
    const res = await fetch(`/api/demands/${demandId}/links`, {
      method: methode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corps),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message ?? "Action impossible.");
    setLiees(data);
  }

  async function lier() {
    setErreur("");
    setEnvoi(true);
    try {
      await appel("POST", {
        cible: saisie,
        kind: doublon ? "DOUBLON" : "LIEE",
      });
      setSaisie("");
      setDoublon(false);
      notifier({ titre: "Demandes liées", ton: "succes", duree: 3000 });
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {liees.length === 0 && (
        <p className="text-[13px] text-fg-3">Aucune demande liée.</p>
      )}
      <ul className="flex flex-col">
        {liees.map((d) => (
          <li
            key={d.id}
            className="group flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 transition-colors hover:bg-surface-2"
          >
            <span className="font-mono text-[11.5px] text-fg-4">
              {reference(d.id)}
            </span>
            <Link
              href={`/demands/${d.id}`}
              className={cn(
                "min-w-0 flex-1 truncate rounded-xs text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                d.supprimee
                  ? "text-fg-3 line-through"
                  : "text-fg-1 hover:text-fg",
              )}
            >
              {d.title}
            </Link>
            {d.kind === "DOUBLON" && (
              <span className="rounded-full bg-st-encours/15 px-2 py-px text-[10.5px] font-semibold text-st-encours-fg">
                Doublon
              </span>
            )}
            <span
              role="img"
              aria-label={
                estCodeStatut(d.status) ? STATUTS[d.status].label : d.status
              }
              className={cn(
                "size-2 shrink-0 rounded-full",
                estCodeStatut(d.status) ? STATUTS[d.status].point : "bg-fg-3",
              )}
            />
            {peutModifier && (
              <button
                type="button"
                onClick={() =>
                  appel("DELETE", { cible: d.id }).catch((e) =>
                    notifier({
                      titre: "Action impossible",
                      description: (e as Error).message,
                      ton: "erreur",
                    }),
                  )
                }
                aria-label={`Retirer le lien avec « ${d.title} »`}
                className="flex size-7 items-center justify-center rounded-[7px] text-fg-4 opacity-0 transition-opacity hover:text-fg focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft group-hover:opacity-100"
              >
                <X aria-hidden="true" strokeWidth={2.2} className="size-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>
      {peutModifier && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (saisie.trim()) lier();
          }}
          className="mt-1 flex flex-col gap-2 border-t border-line-soft pt-3"
        >
          <Input
            id="lien-reference"
            label="Lier une demande"
            value={saisie}
            onChange={(e) => setSaisie(e.target.value)}
            placeholder="#7B20E1AA"
            error={erreur || undefined}
            className="h-10 font-mono text-[13px]"
          />
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-[12.5px] text-fg-2">
              <input
                type="checkbox"
                checked={doublon}
                onChange={(e) => setDoublon(e.target.checked)}
                className="size-4 accent-accent"
              />
              C’est un doublon
            </label>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              loading={envoi}
              disabled={!saisie.trim()}
              icon={
                <Link2
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-3.5"
                />
              }
            >
              Lier
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
