"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const MAX = 2000;

export default function CommentForm({ demandId }: { demandId: string }) {
  const router = useRouter();
  const [contenu, setContenu] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    setSucces(false);

    const texte = contenu.trim();
    if (texte.length < 2) {
      setErreur("Écris au moins 2 caractères.");
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch(`/api/demands/${demandId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: texte }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Impossible d'ajouter le commentaire.");

      setContenu("");
      setSucces(true);
      router.refresh(); // recharge la liste des commentaires
      setTimeout(() => setSucces(false), 2500);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form onSubmit={envoyer} className="mt-6">
      <label htmlFor="commentaire" className="sr-only">
        Ajouter un commentaire
      </label>
      <div className="rounded-2xl border border-[#e6e6e6] bg-white focus-within:border-[#111] focus-within:ring-4 focus-within:ring-black/5 transition">
        <textarea
          id="commentaire"
          value={contenu}
          onChange={(e) => setContenu(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) envoyer(e);
          }}
          rows={3}
          placeholder="Écrire un commentaire…"
          className="block w-full resize-none rounded-t-2xl bg-transparent px-4 pt-3 text-sm text-[#111] placeholder:text-[#9a9a9a] outline-none"
        />
        <div className="flex items-center justify-between gap-3 px-3 pb-3 pt-1">
          <span className="text-xs text-[#9a9a9a] tabular-nums pl-1">
            {contenu.length}/{MAX}{" "}
            <span className="hidden sm:inline">
              · Ctrl + Entrée pour envoyer
            </span>
          </span>
          <button
            type="submit"
            disabled={envoi || contenu.trim().length < 2}
            className="inline-flex items-center gap-2 rounded-full bg-[#111] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f3d2e] disabled:bg-[#cfcfcf] disabled:cursor-not-allowed"
          >
            {envoi ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
              </svg>
            )}
            Envoyer
          </button>
        </div>
      </div>
      {erreur && <p className="mt-2 text-sm text-red-600">{erreur}</p>}
      {succes && (
        <p className="mt-2 text-sm font-medium text-[#0f3d2e]">
          ✓ Commentaire ajouté.
        </p>
      )}
    </form>
  );
}
