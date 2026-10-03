"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import Input from "@/components/ui/Input";
import { notifier } from "@/components/ui/Toast";
import { cn } from "@/lib/ui/cn";
import { PASTILLES_VUE } from "@/lib/ui/vues";

const NOMS_COULEUR: Record<string, string> = {
  accent: "Indigo",
  nouvelle: "Bleu",
  encours: "Ambre",
  cloturee: "Vert",
  haute: "Corail",
  annulee: "Rose",
};

// Enregistrer les filtres courants comme vue (F7) : nom + couleur
export default function DialogueVue({
  open,
  onClose,
  requete,
  nomPropose = "",
}: {
  open: boolean;
  onClose: () => void;
  requete: string;
  nomPropose?: string;
}) {
  const router = useRouter();
  const [nom, setNom] = useState(nomPropose);
  const [couleur, setCouleur] = useState("accent");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    if (open) {
      setNom(nomPropose);
      setErreur("");
    }
  }, [open, nomPropose]);

  async function enregistrer() {
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/views", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nom, color: couleur, query: requete }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message ?? "Enregistrement impossible.");
      notifier({
        titre: "Vue enregistrée",
        description: data.name,
        ton: "succes",
      });
      onClose();
      router.refresh();
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Enregistrer la vue"
      description="Retrouvez ces filtres en un clic dans le menu latéral."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={enregistrer}
            loading={envoi}
            loadingLabel="Enregistrement…"
          >
            Enregistrer
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enregistrer();
        }}
        className="flex flex-col gap-4"
      >
        <Input
          id="vue-nom"
          label="Nom de la vue"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          maxLength={60}
          placeholder="Ex. Urgentes non assignées"
          error={erreur || undefined}
          data-autofocus
        />
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold text-fg-1">
            Couleur
          </legend>
          <div className="flex gap-2">
            {Object.entries(PASTILLES_VUE).map(([cle, classe]) => (
              <label key={cle} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="couleur-vue"
                  value={cle}
                  checked={couleur === cle}
                  onChange={() => setCouleur(cle)}
                  className="peer sr-only"
                />
                <span className="sr-only">{NOMS_COULEUR[cle]}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "block size-8 rounded-[9px] ring-offset-2 ring-offset-surface transition-transform duration-200 peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-fg peer-focus-visible:ring-2 peer-focus-visible:ring-accent-soft",
                    classe,
                  )}
                />
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}
