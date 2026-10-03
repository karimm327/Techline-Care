"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import DialogueVue from "@/components/demands/DialogueVue";
import { notifier } from "@/components/ui/Toast";
import type { Vue } from "@/lib/db/queries/view.queries";
import { cn } from "@/lib/ui/cn";
import {
  normaliserRequete,
  PASTILLES_VUE,
  VUES_SUGGEREES,
} from "@/lib/ui/vues";

// Section « Vues enregistrées » de la sidebar (F7). Sans vue : deux suggestions.
export default function SectionVues({ vues }: { vues: Vue[] }) {
  const router = useRouter();
  const chemin = usePathname();
  const params = useSearchParams();
  const [dialogue, setDialogue] = useState(false);
  const courante =
    chemin === "/demands" ? normaliserRequete(params.toString()) : null;
  const suggestions = vues.length === 0;
  const liste: Vue[] = suggestions
    ? VUES_SUGGEREES.map((v, i) => ({
        ...v,
        id: `suggestion-${i}`,
        position: i,
      }))
    : vues;

  async function supprimer(v: Vue) {
    try {
      const res = await fetch(`/api/views/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notifier({
        titre: "Vue supprimée",
        description: v.name,
        ton: "info",
        duree: 4000,
      });
      router.refresh();
    } catch {
      notifier({ titre: "Suppression impossible", ton: "erreur" });
    }
  }

  const nouvelle = () => {
    if (courante) setDialogue(true);
    else
      notifier({
        titre: "Choisissez d’abord des filtres",
        description:
          "Sur le tableau de bord, filtrez puis « Enregistrer la vue ».",
        ton: "info",
      });
  };

  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[.08em] text-fg-4">
        Vues enregistrées
      </p>
      <ul className="flex flex-col gap-0.5">
        {liste.map((v) => {
          const requete = normaliserRequete(v.query);
          const actif = courante === requete;
          return (
            <li key={v.id} className="group/vue relative">
              <Link
                href={`/demands?${requete}`}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "cible-tactile flex h-9 items-center gap-[11px] rounded-[9px] pl-3 pr-9 text-[13.5px] transition-colors duration-[180ms]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-soft",
                  actif
                    ? "bg-accent/15 font-semibold text-fg"
                    : "text-fg-2 hover:bg-surface-hover hover:text-fg",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2 shrink-0 rounded-[3px]",
                    PASTILLES_VUE[v.color] ?? PASTILLES_VUE.accent,
                  )}
                />
                <span className="flex-1 truncate">{v.name}</span>
                {suggestions && <span className="sr-only">(suggestion)</span>}
              </Link>
              {!suggestions && (
                <button
                  type="button"
                  onClick={() => supprimer(v)}
                  aria-label={`Supprimer la vue « ${v.name} »`}
                  className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-[7px] text-fg-4 opacity-0 transition-opacity hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft group-hover/vue:opacity-100"
                >
                  <X
                    aria-hidden="true"
                    strokeWidth={2.2}
                    className="size-3.5"
                  />
                </button>
              )}
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={nouvelle}
            className="cible-tactile flex h-9 w-full items-center gap-[11px] rounded-[9px] px-3 text-left text-[13px] text-fg-3 transition-colors duration-[180ms] hover:bg-surface-hover hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent-soft"
          >
            <Plus aria-hidden="true" strokeWidth={2.2} className="size-3.5" />
            Nouvelle vue
          </button>
        </li>
      </ul>
      <DialogueVue
        open={dialogue}
        onClose={() => setDialogue(false)}
        requete={courante ?? ""}
      />
    </div>
  );
}
