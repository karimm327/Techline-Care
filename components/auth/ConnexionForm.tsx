"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import Input from "@/components/ui/Input";

// Formulaire de connexion : le cookie httpOnly posé par l'API suffit (aucun token côté navigateur)
export default function ConnexionForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resterConnecte, setResterConnecte] = useState(false);
  const [voir, setVoir] = useState(false);
  const [error, setError] = useState("");
  const [tentative, setTentative] = useState(0);
  const [envoi, setEnvoi] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnvoi(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, resterConnecte }),
      });

      if (!res.ok) {
        // Message volontairement générique : ne révèle pas si l'adresse existe
        setError(
          res.status === 401
            ? "Identifiants incorrects. Vérifiez votre e-mail et votre mot de passe."
            : res.status === 429
              ? ((await res.json().catch(() => null))?.error ??
                "Trop de tentatives. Réessayez plus tard.")
              : "Connexion impossible. Réessayez dans un instant.",
        );
        setTentative((n) => n + 1);
        setEnvoi(false);
        return;
      }

      router.push("/demands");
      router.refresh();
    } catch {
      setError("Impossible de joindre le serveur.");
      setTentative((n) => n + 1);
      setEnvoi(false);
    }
  }

  return (
    <form
      className="flex w-full max-w-[400px] animate-rise flex-col gap-[18px] [animation-delay:120ms]"
      onSubmit={handleSubmit}
    >
      <div>
        <h2 className="font-display text-[28px] font-semibold">Connexion</h2>
        <p className="mt-1.5 text-fg-2">
          Utilisez votre adresse professionnelle.
        </p>
      </div>

      {error && (
        // key : la secousse se rejoue à chaque nouvelle erreur
        <Alert key={tentative} tone="danger">
          {error}
        </Alert>
      )}

      <Input
        id="email"
        type="email"
        label="E-mail"
        autoComplete="email"
        placeholder="prenom.nom@techline-care.fr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="h-12 bg-surface text-[15px]"
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-semibold text-fg-1"
          >
            Mot de passe
          </label>
          <a
            href="mailto:support@techline-care.fr?subject=Mot%20de%20passe%20oubli%C3%A9"
            className="rounded-xs text-[13px] text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            Oublié ?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={voir ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 bg-surface pr-12 text-[15px]"
          />
          <button
            type="button"
            onClick={() => setVoir(!voir)}
            aria-label={
              voir ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            aria-pressed={voir}
            className="absolute right-1 top-1 flex size-10 items-center justify-center rounded-[9px] text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            {voir ? (
              <EyeOff
                aria-hidden="true"
                strokeWidth={2}
                className="size-[18px]"
              />
            ) : (
              <Eye aria-hidden="true" strokeWidth={2} className="size-[18px]" />
            )}
          </button>
        </div>
      </div>

      <Checkbox
        label="Rester connecté 30 jours"
        checked={resterConnecte}
        onChange={(e) => setResterConnecte(e.target.checked)}
        className="text-fg-2"
      />

      <Button
        type="submit"
        size="lg"
        loading={envoi}
        loadingLabel="Connexion…"
        className="h-[50px] rounded-xl text-[15px]"
      >
        Se connecter
      </Button>
      <p className="text-center text-[12.5px] text-fg-4">
        Accès réservé aux équipes TechLine Care.
      </p>
    </form>
  );
}
