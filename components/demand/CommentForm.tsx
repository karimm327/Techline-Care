"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Kbd from "@/components/ui/Kbd";
import { notifier } from "@/components/ui/Toast";
import { cn } from "@/lib/ui/cn";

const MAX = 2000;

// Composer de commentaire : zone auto-extensible, Ctrl/⌘ + Entrée pour envoyer
export default function CommentForm({ demandId }: { demandId: string }) {
  const router = useRouter();
  const zone = useRef<HTMLTextAreaElement>(null);
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  // Hauteur ajustée au contenu (3 lignes minimum, 320 px maximum)
  // biome-ignore lint/correctness/useExhaustiveDependencies: recalcul volontaire à chaque frappe
  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(320, el.scrollHeight)}px`;
  }, [contenu]);

  async function envoyer() {
    setErreur("");
    const texte = contenu.trim();
    if (texte.length < 2) {
      setErreur("Écris au moins 2 caractères.");
      return;
    }
    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${demandId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: texte }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Impossible d'ajouter le commentaire.");
      setContenu("");
      notifier({ titre: "Commentaire ajouté", ton: "succes", duree: 4000 });
      router.refresh(); // recharge la liste des commentaires
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

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
          "overflow-hidden rounded-[14px] border bg-field-focus transition-[border-color,box-shadow] duration-[180ms] focus-within:border-accent-soft focus-within:shadow-focus",
          erreur ? "border-danger" : "border-line-strong",
        )}
      >
        <label htmlFor="commentaire" className="sr-only">
          Votre commentaire
        </label>
        <textarea
          ref={zone}
          id="commentaire"
          value={contenu}
          onChange={(e) => setContenu(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              envoyer();
            }
          }}
          rows={3}
          placeholder="Écrire un commentaire…"
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? "commentaire-erreur" : "commentaire-aide"}
          className="block max-h-80 min-h-[84px] w-full resize-none bg-transparent px-4 py-3.5 text-sm text-fg placeholder:text-fg-4 focus:outline-none"
        />
        <div className="flex flex-wrap items-center gap-2 border-t border-line px-2.5 py-2">
          <span
            id="commentaire-aide"
            className="pl-1.5 text-xs tabular-nums text-fg-4"
          >
            {contenu.length}/{MAX}
          </span>
          <span className="flex-1" />
          <Button
            type="submit"
            size="sm"
            className="h-9 px-3.5"
            loading={envoi}
            loadingLabel="Envoi…"
            disabled={contenu.trim().length < 2}
            icon={
              <Send aria-hidden="true" strokeWidth={2} className="size-3.5" />
            }
          >
            Envoyer
            <Kbd className="ml-1 hidden border-fg/30 bg-fg/10 text-current sm:inline-flex">
              Ctrl ↵
            </Kbd>
          </Button>
        </div>
      </div>
      {erreur && (
        <p
          id="commentaire-erreur"
          key={erreur}
          className="mt-2 animate-shake text-[12.5px] font-medium text-danger-fg"
        >
          {erreur}
        </p>
      )}
    </form>
  );
}
