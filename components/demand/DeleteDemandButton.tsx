"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Dialog from "@/components/ui/Dialog";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/ui/cn";

const MOTIFS_RAPIDES = [
  "Doublon d'une autre demande",
  "Créée par erreur",
  "Demande annulée par le demandeur",
  "Hors périmètre du support",
];

// Zone « danger » de la page Modifier : supprimer la demande avec un motif obligatoire
export default function DeleteDemandButton({
  id,
  titre,
}: {
  id: string;
  titre: string;
}) {
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [motif, setMotif] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  const motifValide = motif.trim().length >= 5;

  function fermer() {
    if (envoi) return;
    setOuvert(false);
    setErreur("");
  }

  async function supprimer() {
    if (!motifValide) {
      setErreur(
        "Expliquez pourquoi vous supprimez cette demande (5 caractères minimum).",
      );
      return;
    }
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch(`/api/demands/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: motif.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "La suppression a échoué.");
      }
      router.push(`/demands?supprimee=${id}`);
      router.refresh();
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  }

  return (
    <>
      <Card
        as="section"
        aria-labelledby="titre-zone-danger"
        className="flex flex-col gap-4 border-danger/35 sm:flex-row sm:items-center"
      >
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-danger/15 text-danger-fg"
        >
          <Trash2 strokeWidth={2} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="titre-zone-danger" className="font-semibold">
            Supprimer la demande
          </h2>
          <p className="mt-0.5 text-[13px] text-fg-3">
            Elle disparaîtra de la liste. Le motif est enregistré dans le
            journal d’activité et un administrateur pourra la restaurer.
          </p>
        </div>
        <Button variant="danger" onClick={() => setOuvert(true)}>
          Supprimer
        </Button>
      </Card>

      <Dialog
        open={ouvert}
        onClose={fermer}
        title="Supprimer cette demande ?"
        description={`« ${titre} »`}
        footer={
          <>
            <Button variant="secondary" onClick={fermer} disabled={envoi}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={supprimer}
              loading={envoi}
              loadingLabel="Suppression…"
              disabled={!motifValide}
            >
              Supprimer la demande
            </Button>
          </>
        }
      >
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-fg-1">
            Motifs fréquents
          </legend>
          <div className="mb-3 flex flex-wrap gap-2">
            {MOTIFS_RAPIDES.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={motif === m}
                onClick={() => {
                  setMotif(m);
                  setErreur("");
                }}
                className={cn(
                  "cible-tactile h-8 rounded-full px-3 text-xs font-medium transition-colors duration-[180ms] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                  motif === m
                    ? "bg-danger/25 text-danger-fg ring-1 ring-inset ring-danger/50"
                    : "bg-surface-2 text-fg-2 ring-1 ring-inset ring-line-strong/70 hover:text-fg",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </fieldset>
        <Textarea
          id="motif"
          label="Pourquoi la supprimer ? (obligatoire)"
          value={motif}
          onChange={(e) => {
            setMotif(e.target.value);
            setErreur("");
          }}
          rows={3}
          maxLength={500}
          counter
          placeholder="Ex. : la même demande existe déjà (#A1B2C3D4)"
          error={erreur || undefined}
          data-autofocus
        />
      </Dialog>
    </>
  );
}
