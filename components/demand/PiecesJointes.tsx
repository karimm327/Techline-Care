"use client";

import { Download, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DropZone from "@/components/ui/DropZone";
import { notifier } from "@/components/ui/Toast";
import type { PieceJointe } from "@/lib/db/queries/attachment.queries";
import { cn } from "@/lib/ui/cn";
import {
  envoyerFichier,
  typeFichier,
  verifierFichier,
} from "@/lib/ui/envoiFichier";
import { tailleLisible } from "@/lib/ui/format";

type EnCours = { cle: string; nom: string; ratio: number; erreur?: string };

type Props = {
  demandId: string;
  pieces: PieceJointe[];
  // ADMIN / AGENT sur une demande non supprimée
  peutAjouter: boolean;
  moiId: string;
  admin: boolean;
  // Liste seule (carte Description), sans zone de dépôt
  compact?: boolean;
};

// Pièces jointes d'une demande (F9) : liste, téléchargement, ajout avec progression, retrait
export default function PiecesJointes({
  demandId,
  pieces,
  peutAjouter,
  moiId,
  admin,
  compact = false,
}: Props) {
  const router = useRouter();
  const [enCours, setEnCours] = useState<EnCours[]>([]);

  async function ajouter(fichiers: File[]) {
    for (const f of fichiers) {
      const cle = `${f.name}-${f.size}-${Date.now()}`;
      const refus = verifierFichier(f);
      if (refus) {
        notifier({ titre: f.name, description: refus, ton: "erreur" });
        continue;
      }
      setEnCours((l) => [...l, { cle, nom: f.name, ratio: 0 }]);
      try {
        await envoyerFichier(
          `/api/demands/${demandId}/attachments`,
          f,
          (ratio) =>
            setEnCours((l) =>
              l.map((e) => (e.cle === cle ? { ...e, ratio } : e)),
            ),
        );
        setEnCours((l) => l.filter((e) => e.cle !== cle));
      } catch (err) {
        setEnCours((l) => l.filter((e) => e.cle !== cle));
        notifier({
          titre: f.name,
          description: (err as Error).message,
          ton: "erreur",
        });
      }
    }
    router.refresh();
  }

  async function retirer(p: PieceJointe) {
    try {
      const res = await fetch(`/api/attachments/${p.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? "Retrait impossible.");
      notifier({
        titre: "Fichier retiré",
        description: p.file_name,
        ton: "info",
      });
      router.refresh();
    } catch (e) {
      notifier({
        titre: "Retrait impossible",
        description: (e as Error).message,
        ton: "erreur",
      });
    }
  }

  if (compact && pieces.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2.5", compact && "mt-4")}>
      {pieces.length === 0 && enCours.length === 0 && !compact && (
        <p className="rounded-xl bg-surface-inset px-4 py-6 text-center text-fg-3">
          Aucune pièce jointe pour l’instant.
        </p>
      )}
      <ul className={cn("flex flex-wrap gap-2.5", !compact && "flex-col")}>
        {pieces.map((p, i) => {
          const t = typeFichier(p.file_name, p.mime_type);
          const peutRetirer =
            peutAjouter && !compact && (p.id_uploader === moiId || admin);
          return (
            <li
              key={p.id}
              className="flex animate-rise items-center gap-2.5 rounded-[10px] border border-line bg-surface-inset py-2 pl-3 pr-1.5 text-[13px]"
              style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-[7px] text-[10px] font-bold",
                  t.classe,
                )}
              >
                {t.libelle}
              </span>
              <a
                href={`/api/attachments/${p.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate rounded-xs text-fg-1 hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                {p.file_name}
              </a>
              <span className="shrink-0 text-fg-4">
                {tailleLisible(p.size_bytes)}
              </span>
              <a
                href={`/api/attachments/${p.id}?telecharger=1`}
                aria-label={`Télécharger ${p.file_name}`}
                className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                <Download
                  aria-hidden="true"
                  strokeWidth={2}
                  className="size-4"
                />
              </a>
              {peutRetirer && (
                <button
                  type="button"
                  onClick={() => retirer(p)}
                  aria-label={`Retirer ${p.file_name}`}
                  className="flex size-8 shrink-0 items-center justify-center rounded-[8px] text-fg-3 transition-colors hover:bg-danger/15 hover:text-danger-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                >
                  <X aria-hidden="true" strokeWidth={2.2} className="size-4" />
                </button>
              )}
            </li>
          );
        })}
        {enCours.map((e) => (
          <li
            key={e.cle}
            className="flex items-center gap-3 rounded-[11px] border border-line bg-surface-inset px-3 py-2.5 text-[13px]"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-[8px] text-[10px] font-bold",
                typeFichier(e.nom).classe,
              )}
            >
              {typeFichier(e.nom).libelle}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex justify-between gap-3">
                <span className="truncate">{e.nom}</span>
                <span className="text-fg-3 tabular-nums">
                  {Math.round(e.ratio * 100)} %
                </span>
              </span>
              <span
                role="progressbar"
                aria-label={`Envoi de ${e.nom}`}
                aria-valuenow={Math.round(e.ratio * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-1.5 block h-[5px] overflow-hidden rounded-full bg-bg-sunken"
              >
                <span
                  className="block h-full origin-left rounded-full bg-accent transition-transform duration-200"
                  style={{ transform: `scaleX(${e.ratio})` }}
                />
              </span>
            </span>
          </li>
        ))}
      </ul>
      {peutAjouter && !compact && <DropZone onFichiers={ajouter} />}
    </div>
  );
}
