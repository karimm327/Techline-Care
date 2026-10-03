"use client";

import { Lock, Plus } from "lucide-react";
import { Fragment, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { notifier } from "@/components/ui/Toast";
import type { Commentaire } from "@/lib/db/queries/comment.queries";
import { decouperMentions } from "@/lib/demandes/mentions";
import { cn } from "@/lib/ui/cn";
import { dateCourte, dateHeure, heure } from "@/lib/ui/format";
import TexteAvecLiens from "./TexteAvecLiens";

type Props = {
  commentaires: Commentaire[];
  // Noms surlignés quand ils sont mentionnés (@Prénom Nom)
  noms: string[];
  // ADMIN / AGENT : réactions possibles
  peutReagir: boolean;
  vide: string;
};

// « aujourd'hui à 10:48 », « 30 sept. 2026 à 09:12 »
function quand(d: string) {
  const date = new Date(d);
  const aujourdhui = new Date().toDateString() === date.toDateString();
  return `${aujourdhui ? "aujourd’hui" : dateCourte(date)} à ${heure(date)}`;
}

function Contenu({ texte, noms }: { texte: string; noms: string[] }) {
  return (
    <>
      {decouperMentions(texte, noms).map((s, i) =>
        s.mention ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: découpage stable d'un texte figé
            key={i}
            className="rounded-[4px] bg-accent/20 px-1 font-medium text-accent-fg-2"
          >
            {s.texte}
          </span>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: découpage stable d'un texte figé
          <Fragment key={i}>
            <TexteAvecLiens texte={s.texte} />
          </Fragment>
        ),
      )}
    </>
  );
}

function Reaction({ c, peutReagir }: { c: Commentaire; peutReagir: boolean }) {
  const [etat, setEtat] = useState({ actif: c.moi_plus1, total: c.plus1 });

  async function basculer() {
    const avant = etat;
    setEtat({
      actif: !avant.actif,
      total: avant.total + (avant.actif ? -1 : 1),
    });
    try {
      const res = await fetch(`/api/comments/${c.id_comment}/reactions`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      setEtat(await res.json());
    } catch {
      setEtat(avant);
      notifier({ titre: "Réaction impossible", ton: "erreur" });
    }
  }

  if (!peutReagir && etat.total === 0) return null;
  return (
    <div className="mt-1.5 flex gap-1.5">
      {(etat.total > 0 || !peutReagir) && (
        <button
          type="button"
          onClick={peutReagir ? basculer : undefined}
          disabled={!peutReagir}
          aria-pressed={etat.actif}
          aria-label={`Approuver (+1), ${etat.total} personne${etat.total > 1 ? "s" : ""}`}
          className={cn(
            "inline-flex h-[26px] items-center rounded-full border px-2 text-xs transition-colors duration-200 disabled:cursor-default",
            etat.actif
              ? "border-accent-fg/40 bg-accent/15 text-accent-fg-2"
              : "border-line-strong/70 text-fg-2 hover:bg-surface-2",
          )}
        >
          +1 · {etat.total}
        </button>
      )}
      {peutReagir && etat.total === 0 && (
        <button
          type="button"
          onClick={basculer}
          aria-label="Ajouter une réaction +1"
          className="inline-flex h-[26px] items-center gap-1 rounded-full border border-line-strong/70 px-2 text-xs text-fg-3 opacity-0 transition-opacity duration-200 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Plus aria-hidden="true" strokeWidth={2.2} className="size-3" />1
        </button>
      )}
    </div>
  );
}

// Fil de commentaires (publics ou notes internes) : bulles, @mentions surlignées, réactions +1
export default function FilConversation({
  commentaires,
  noms,
  peutReagir,
  vide,
}: Props) {
  if (commentaires.length === 0) {
    return (
      <p className="rounded-xl bg-surface-inset px-4 py-6 text-center text-fg-3">
        {vide}
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-[18px]">
      {commentaires.map((c, i) => {
        const auteur =
          `${c.author_first_name ?? ""} ${c.author_last_name ?? ""}`.trim() ||
          "Utilisateur";
        return (
          <li
            key={c.id_comment}
            className="group flex animate-rise gap-3"
            style={{ animationDelay: `${250 + Math.min(i, 8) * 70}ms` }}
          >
            <Avatar id={c.id_author} name={auteur} size={36} decorative />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-x-1 text-[13px]">
                <span className="font-semibold">{auteur}</span>
                <span className="text-fg-4">
                  ·{" "}
                  <time dateTime={c.created_at} title={dateHeure(c.created_at)}>
                    {quand(c.created_at)}
                  </time>
                </span>
                {c.is_internal && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-st-encours/15 px-2 py-px text-[11px] font-semibold text-st-encours-fg">
                    <Lock
                      aria-hidden="true"
                      strokeWidth={2.2}
                      className="size-3"
                    />
                    Note interne
                  </span>
                )}
              </p>
              <p
                className={cn(
                  "mt-1.5 inline-block max-w-full whitespace-pre-line break-words rounded-[4px_14px_14px_14px] px-3.5 py-2.5 text-fg-1",
                  c.is_internal
                    ? "border border-dashed border-st-encours/40 bg-st-encours/10"
                    : "bg-surface-2",
                )}
              >
                <Contenu texte={c.content} noms={noms} />
              </p>
              <Reaction c={c} peutReagir={peutReagir} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
