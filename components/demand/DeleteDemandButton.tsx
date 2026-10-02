"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
  const zoneTexte = useRef<HTMLTextAreaElement>(null);

  const motifValide = motif.trim().length >= 5;

  // Échap ferme la fenêtre ; on bloque le défilement de la page derrière
  // biome-ignore lint/correctness/useExhaustiveDependencies: fermer() ne dépend que de setters stables
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) =>
      e.key === "Escape" && !envoi && fermer();
    document.addEventListener("keydown", surTouche);
    document.body.style.overflow = "hidden";
    setTimeout(() => zoneTexte.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", surTouche);
      document.body.style.overflow = "";
    };
  }, [ouvert, envoi]);

  function fermer() {
    setOuvert(false);
    setErreur("");
  }

  async function supprimer() {
    if (!motifValide) {
      setErreur(
        "Explique pourquoi tu supprimes cette demande (5 caractères minimum).",
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
      {/* Zone danger */}
      <section className="mt-8 rounded-2xl border border-red-200 bg-white overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
          <span className="w-11 h-11 shrink-0 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">
              Supprimer la demande
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Elle disparaîtra de la liste. Le motif est enregistré dans le
              journal d&apos;activité et un administrateur pourra la restaurer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOuvert(true)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-white ring-1 ring-red-300 hover:bg-red-600 hover:text-white hover:ring-red-600 transition"
          >
            Supprimer
          </button>
        </div>
      </section>

      {/* Petite fenêtre de confirmation */}
      {ouvert && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="titre-suppression"
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: voile décoratif, Échap ferme aussi la fenêtre */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: voile décoratif, Échap ferme aussi la fenêtre */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !envoi && fermer()}
          />

          <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <span className="w-11 h-11 shrink-0 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 9v4M12 17h.01" />
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h3
                    id="titre-suppression"
                    className="text-lg font-semibold text-slate-900"
                  >
                    Supprimer cette demande ?
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 break-words">
                    « {titre} »
                  </p>
                </div>
              </div>

              <label
                htmlFor="motif"
                className="block mt-6 text-sm font-medium text-slate-700"
              >
                Pourquoi la supprimer ? <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOTIFS_RAPIDES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMotif(m);
                      setErreur("");
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ring-1 transition ${motif === m ? "bg-red-600 text-white ring-red-600" : "bg-slate-50 text-slate-600 ring-slate-200 hover:ring-slate-300"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <textarea
                id="motif"
                ref={zoneTexte}
                value={motif}
                onChange={(e) => {
                  setMotif(e.target.value);
                  setErreur("");
                }}
                rows={3}
                maxLength={500}
                placeholder="Ex. : la même demande existe déjà (#A1B2C3D4)"
                className={`mt-3 w-full rounded-xl border bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-4 ${erreur ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-slate-200 focus:border-red-400 focus:ring-red-100"}`}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span className="text-red-600">{erreur}</span>
                <span className="text-slate-400">{motif.length}/500</span>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={fermer}
                disabled={envoi}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-100 transition disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={supprimer}
                disabled={envoi || !motifValide}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {envoi && (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {envoi ? "Suppression…" : "Supprimer la demande"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
