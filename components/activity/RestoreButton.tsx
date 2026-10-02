"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// Bouton « Restaurer » d'une demande supprimée (ADMIN)
export default function RestoreButton({
  id,
  variante = "plein",
}: {
  id: string;
  variante?: "plein" | "lien";
}) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");

  async function restaurer() {
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch(`/api/demands/${id}/restore`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Restauration impossible.");
      }
      router.refresh();
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  const classes =
    variante === "lien"
      ? "text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 disabled:opacity-50"
      : "inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition disabled:opacity-60";

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={restaurer}
        disabled={envoi}
        className={classes}
      >
        {variante === "plein" &&
          (envoi ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
            </svg>
          ))}
        {envoi ? "Restauration…" : "Restaurer"}
      </button>
      {erreur && <span className="text-xs text-red-600">{erreur}</span>}
    </span>
  );
}
