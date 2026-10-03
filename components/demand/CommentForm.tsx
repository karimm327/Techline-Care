"use client";

import { AtSign, Lock, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Kbd from "@/components/ui/Kbd";
import { notifier } from "@/components/ui/Toast";
import type { Personne } from "@/lib/demandes/mentions";
import { cn } from "@/lib/ui/cn";
import { signalerFrappe } from "./Presence";

const MAX = 2000;

export type ReponseRapide = { id: string; label: string; content: string };

type Props = {
  demandId: string;
  // Personnes proposées après « @ »
  mentionnables?: Personne[];
  // Réponses rapides (chips + « / » en début de message)
  reponsesRapides?: ReponseRapide[];
  // Composer de l'onglet « Notes internes »
  interne?: boolean;
};

type Suggestion =
  | { type: "personne"; id: string; libelle: string; personne: Personne }
  | { type: "reponse"; id: string; libelle: string; reponse: ReponseRapide };

const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Mot en cours de saisie avant le curseur : « @luc » ou « /rel » (en début de message)
function jetonEnCours(texte: string, curseur: number) {
  const avant = texte.slice(0, curseur);
  const mention = /(^|\s)@([\p{L}\p{N}'’-]*(?: [\p{L}\p{N}'’-]*)?)$/u.exec(
    avant,
  );
  if (mention) {
    return {
      type: "personne" as const,
      terme: mention[2],
      debut: curseur - mention[2].length - 1,
    };
  }
  const commande = /^\/([\p{L}\p{N} ]*)$/u.exec(avant);
  if (commande) {
    return { type: "reponse" as const, terme: commande[1], debut: 0 };
  }
  return null;
}

// Composer : zone auto-extensible, @mentions, réponses rapides, Ctrl/⌘ + Entrée pour envoyer
export default function CommentForm({
  demandId,
  mentionnables = [],
  reponsesRapides = [],
  interne = false,
}: Props) {
  const router = useRouter();
  const zone = useRef<HTMLTextAreaElement>(null);
  const idListe = useId();
  const champId = interne ? "note-interne" : "commentaire";
  const [contenu, setContenu] = useState("");
  const [curseur, setCurseur] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [indexSuggestion, setIndexSuggestion] = useState(0);
  const [suggestionsFermees, setSuggestionsFermees] = useState(false);

  // Hauteur ajustée au contenu (3 lignes minimum, 320 px maximum)
  // biome-ignore lint/correctness/useExhaustiveDependencies: recalcul volontaire à chaque frappe
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(320, el.scrollHeight)}px`;
  }, [contenu]);

  const jeton = jetonEnCours(contenu, curseur);
  const suggestions = useMemo<Suggestion[]>(() => {
    if (!jeton || suggestionsFermees) return [];
    const t = normaliser(jeton.terme);
    if (jeton.type === "personne") {
      return mentionnables
        .filter((p) => normaliser(p.nom).includes(t))
        .slice(0, 6)
        .map((p) => ({
          type: "personne",
          id: p.id,
          libelle: p.nom,
          personne: p,
        }));
    }
    return reponsesRapides
      .filter((r) => normaliser(r.label).includes(t))
      .slice(0, 6)
      .map((r) => ({
        type: "reponse",
        id: r.id,
        libelle: r.label,
        reponse: r,
      }));
  }, [jeton, mentionnables, reponsesRapides, suggestionsFermees]);
  const listeOuverte = suggestions.length > 0;
  const actif = Math.min(indexSuggestion, suggestions.length - 1);

  function remplacer(debut: number, fin: number, insertion: string) {
    const suivant = (
      contenu.slice(0, debut) +
      insertion +
      contenu.slice(fin)
    ).slice(0, MAX);
    const position = Math.min(MAX, debut + insertion.length);
    setContenu(suivant);
    setCurseur(position);
    requestAnimationFrame(() => {
      zone.current?.focus();
      zone.current?.setSelectionRange(position, position);
    });
  }

  function choisir(s: Suggestion) {
    if (!jeton) return;
    if (s.type === "personne")
      remplacer(jeton.debut, curseur, `@${s.personne.nom} `);
    else remplacer(0, curseur, s.reponse.content);
    setIndexSuggestion(0);
  }

  function insererReponse(r: ReponseRapide) {
    const prefixe = contenu.trim() ? `${contenu.replace(/\s*$/, "")}\n` : "";
    remplacer(0, contenu.length, `${prefixe}${r.content}`);
  }

  async function envoyer() {
    setErreur("");
    const texte = contenu.trim();
    if (texte.length < 2) {
      setErreur("Écrivez au moins 2 caractères.");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${demandId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texte, interne }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Impossible d'ajouter le commentaire.");
      setContenu("");
      setCurseur(0);
      notifier({
        titre: interne ? "Note interne ajoutée" : "Commentaire ajouté",
        ton: "succes",
        duree: 4000,
      });
      router.refresh(); // recharge la conversation
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  const majCurseur = (el: HTMLTextAreaElement) => setCurseur(el.selectionStart);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        envoyer();
      }}
      className="mt-5"
    >
      <div
        className={cn(
          "relative rounded-[14px] border bg-field-focus transition-[border-color,box-shadow] duration-[180ms] focus-within:border-accent-soft focus-within:shadow-focus",
          erreur
            ? "border-danger"
            : interne
              ? "border-dashed border-st-encours/50"
              : "border-line-strong",
        )}
      >
        <label htmlFor={champId} className="sr-only">
          {interne ? "Votre note interne" : "Votre commentaire"}
        </label>
        {/* Zone + suggestions ancrées juste sous le texte */}
        <div className="relative">
          <textarea
            ref={zone}
            id={champId}
            value={contenu}
            role="combobox"
            aria-expanded={listeOuverte}
            aria-controls={idListe}
            aria-autocomplete="list"
            aria-activedescendant={
              listeOuverte ? `${idListe}-${suggestions[actif]?.id}` : undefined
            }
            onChange={(e) => {
              setContenu(e.target.value.slice(0, MAX));
              // Les autres voient « … est en train d'écrire » (notes internes exclues)
              if (!interne && e.target.value.trim()) signalerFrappe(demandId);
              majCurseur(e.target);
              setSuggestionsFermees(false);
              setIndexSuggestion(0);
            }}
            onSelect={(e) => majCurseur(e.currentTarget)}
            onKeyDown={(e) => {
              if (listeOuverte) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const pas = e.key === "ArrowDown" ? 1 : -1;
                  setIndexSuggestion(
                    (actif + pas + suggestions.length) % suggestions.length,
                  );
                  return;
                }
                if (e.key === "Enter" || e.key === "Tab") {
                  if (!(e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    choisir(suggestions[actif]);
                    return;
                  }
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  e.stopPropagation();
                  setSuggestionsFermees(true);
                  return;
                }
              }
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                envoyer();
              }
            }}
            rows={3}
            placeholder={
              interne
                ? "Note visible des agents et administrateurs uniquement…"
                : "Écrire un commentaire… @ pour mentionner, / pour une réponse rapide"
            }
            aria-invalid={erreur ? true : undefined}
            aria-describedby={erreur ? `${champId}-erreur` : `${champId}-aide`}
            className="block max-h-80 min-h-[84px] w-full resize-none rounded-t-[14px] bg-transparent px-4 py-3.5 text-sm text-fg placeholder:text-fg-4 focus:outline-none"
          />

          {listeOuverte && (
            <div
              id={idListe}
              role="listbox"
              aria-label={
                jeton?.type === "personne" ? "Personnes" : "Réponses rapides"
              }
              className="absolute left-3 top-full z-20 mt-1 w-[min(320px,calc(100%-24px))] animate-menu rounded-xl border border-line-strong bg-surface-2 p-1.5 shadow-lg"
            >
              {suggestions.map((s, i) => (
                <div
                  key={s.id}
                  id={`${idListe}-${s.id}`}
                  role="option"
                  tabIndex={-1}
                  aria-selected={i === actif}
                  onMouseDown={(e) => {
                    e.preventDefault(); // garde le focus dans la zone
                    choisir(s);
                  }}
                  onMouseEnter={() => setIndexSuggestion(i)}
                  className={cn(
                    "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2.5 text-[13.5px] text-fg-1",
                    i === actif && "bg-accent/20 text-fg",
                  )}
                >
                  {s.type === "personne" ? (
                    <Avatar
                      id={s.personne.id}
                      name={s.personne.nom}
                      size={24}
                      decorative
                    />
                  ) : (
                    <span className="font-mono text-xs text-fg-4">/</span>
                  )}
                  <span className="min-w-0 flex-1 truncate">{s.libelle}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-line px-2.5 py-2">
          {mentionnables.length > 0 && (
            <button
              type="button"
              aria-label="Mentionner quelqu’un"
              onClick={() => {
                const el = zone.current;
                const pos = el ? el.selectionStart : contenu.length;
                const espace =
                  pos > 0 && !/\s/.test(contenu.charAt(pos - 1)) ? " " : "";
                remplacer(pos, pos, `${espace}@`);
              }}
              className="inline-flex size-8 items-center justify-center rounded-[7px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
            >
              <AtSign aria-hidden="true" strokeWidth={2} className="size-4" />
            </button>
          )}
          {reponsesRapides.length > 0 && (
            <>
              <span
                aria-hidden="true"
                className="mx-1 h-[18px] w-px bg-line-strong/70"
              />
              {reponsesRapides.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => insererReponse(r)}
                  title={r.content}
                  className="h-7 rounded-full border border-line-strong/70 px-2.5 text-xs text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                >
                  {r.label}
                </button>
              ))}
            </>
          )}
          <span className="flex-1" />
          <span
            id={`${champId}-aide`}
            className="px-1 text-xs tabular-nums text-fg-4"
          >
            {contenu.length}/{MAX}
          </span>
          <Button
            type="submit"
            size="sm"
            className="h-9 px-3.5"
            loading={envoi}
            loadingLabel="Envoi…"
            disabled={contenu.trim().length < 2}
            icon={
              interne ? (
                <Lock aria-hidden="true" strokeWidth={2} className="size-3.5" />
              ) : (
                <Send aria-hidden="true" strokeWidth={2} className="size-3.5" />
              )
            }
          >
            {interne ? "Ajouter la note" : "Envoyer"}
            <Kbd className="ml-1 hidden border-fg/30 bg-fg/10 text-current sm:inline-flex">
              Ctrl ↵
            </Kbd>
          </Button>
        </div>
      </div>
      {erreur && (
        <p
          id={`${champId}-erreur`}
          key={erreur}
          className="mt-2 animate-shake text-[12.5px] font-medium text-danger-fg"
        >
          {erreur}
        </p>
      )}
    </form>
  );
}
