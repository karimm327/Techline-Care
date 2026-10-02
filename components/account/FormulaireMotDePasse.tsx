"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { notifier } from "@/components/ui/Toast";
import { cn } from "@/lib/ui/cn";

const NIVEAUX = [
  { label: "Trop faible", barre: "bg-danger", texte: "text-danger-fg" },
  { label: "Faible", barre: "bg-prio-haute", texte: "text-prio-haute-fg" },
  { label: "Moyen", barre: "bg-st-encours", texte: "text-st-encours-fg" },
  { label: "Bon", barre: "bg-st-nouvelle", texte: "text-st-nouvelle-fg" },
  { label: "Excellent", barre: "bg-success", texte: "text-success-fg" },
];

// Changement de mot de passe (API existante PUT /api/users/me/password) + jauge de force
export default function FormulaireMotDePasse() {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const regles = [
    { ok: nouveau.length >= 8, texte: "8 caractères minimum" },
    { ok: /[A-Z]/.test(nouveau), texte: "1 majuscule" },
    { ok: /\d/.test(nouveau), texte: "1 chiffre" },
    {
      ok: nouveau.length > 0 && nouveau === confirmation,
      texte: "Les deux mots de passe correspondent",
    },
  ];
  const force = nouveau
    ? regles.slice(0, 3).filter((r) => r.ok).length +
      (/[^A-Za-z0-9]/.test(nouveau) ? 1 : 0)
    : 0;
  const niveau = NIVEAUX[force];
  const valide = actuel.length > 0 && regles.every((r) => r.ok);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!valide) return;
    setEnvoi(true);
    setErreur("");
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actuel, nouveau }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.message || "Impossible de modifier le mot de passe.",
        );
      notifier({ titre: "Mot de passe modifié", ton: "succes" });
      setActuel("");
      setNouveau("");
      setConfirmation("");
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  const type = voir ? "text" : "password";
  return (
    <form onSubmit={enregistrer} className="flex max-w-lg flex-col gap-4">
      {erreur && (
        <Alert tone="danger" title="Mot de passe non modifié">
          {erreur}
        </Alert>
      )}
      <Input
        id="mdp-actuel"
        label="Mot de passe actuel"
        type={type}
        autoComplete="current-password"
        value={actuel}
        onChange={(e) => setActuel(e.target.value)}
      />
      <div>
        <Input
          id="mdp-nouveau"
          label="Nouveau mot de passe"
          type={type}
          autoComplete="new-password"
          value={nouveau}
          onChange={(e) => setNouveau(e.target.value)}
        />
        <div className="mt-2.5 flex items-center gap-3">
          <div aria-hidden="true" className="grid flex-1 grid-cols-4 gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-[transform,background-color] duration-[350ms] ease-spring",
                  i < force
                    ? cn(niveau.barre, "scale-x-100")
                    : "scale-x-[.92] bg-bg-sunken",
                )}
              />
            ))}
          </div>
          <span
            aria-live="polite"
            className={cn(
              "min-w-[78px] text-right text-xs font-semibold",
              nouveau ? niveau.texte : "text-fg-4",
            )}
          >
            {nouveau ? niveau.label : "—"}
          </span>
        </div>
      </div>
      <Input
        id="mdp-confirmation"
        label="Confirmer le nouveau mot de passe"
        type={type}
        autoComplete="new-password"
        value={confirmation}
        onChange={(e) => setConfirmation(e.target.value)}
      />
      <ul className="grid gap-1.5 text-[13px] sm:grid-cols-2">
        {regles.map((r) => (
          <li
            key={r.texte}
            className={cn(
              "flex items-center gap-2",
              r.ok ? "text-success-fg" : "text-fg-3",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-4 items-center justify-center rounded-full transition-transform duration-300 ease-spring",
                r.ok
                  ? "scale-100 bg-success text-ink"
                  : "scale-90 ring-1 ring-line-hover",
              )}
            >
              {r.ok && <Check strokeWidth={3} className="size-3" />}
            </span>
            {r.texte}
            <span className="sr-only">
              {r.ok ? " : respecté" : " : à respecter"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setVoir((v) => !v)}
          aria-pressed={voir}
          className="cible-tactile inline-flex h-9 items-center gap-2 rounded-[9px] px-2.5 text-[13px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          {voir ? (
            <EyeOff aria-hidden="true" strokeWidth={1.9} className="size-4" />
          ) : (
            <Eye aria-hidden="true" strokeWidth={1.9} className="size-4" />
          )}
          {voir ? "Masquer les mots de passe" : "Afficher les mots de passe"}
        </button>
        <Button
          type="submit"
          disabled={!valide}
          loading={envoi}
          loadingLabel="Enregistrement…"
        >
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
}
