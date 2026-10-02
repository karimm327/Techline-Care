"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConnexionForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [voir, setVoir] = useState(false);
  const [error, setError] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur de connexion");
        setEnvoi(false);
        return;
      }

      router.push("/demands");
      router.refresh();
    } catch (err) {
      console.log(err);
      setError("Impossible de joindre l'API");
      setEnvoi(false);
    }
  }

  const champ =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="prenom.nom@techline-care.fr"
          className={champ}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={voir ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`${champ} pr-12`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setVoir(!voir)}
            aria-label={
              voir ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            className="absolute inset-y-0 right-0 px-4 text-slate-400 hover:text-slate-700"
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {voir ? (
                <>
                  <path d="M17.9 17.9A10 10 0 0 1 12 20c-6.5 0-10-8-10-8a18 18 0 0 1 5.1-6M9.9 4.2A9 9 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.2 3.2M1 1l22 22" />
                  <path d="M14.1 14.1a3 3 0 1 1-4.2-4.2" />
                </>
              ) : (
                <>
                  <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg
            aria-hidden="true"
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={envoi}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-wait"
      >
        {envoi && (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        )}
        {envoi ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
