"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erreur de connexion");
                return;
            }

            console.log("=== CONNEXION RÉUSSIE ===");
            console.log("Token JWT reçu :", data.token);

            localStorage.setItem("token", data.token);
            window.dispatchEvent(new Event("auth-changed")); // ← ajouté

            // Redirection (Étape 2)
            router.push("/demands");
        } catch (err) {
            console.log(err)
            setError("Impossible de joindre l'API");
        }
    }

    return (
        <div className="max-w-md mx-auto p-6">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-800">Connexion</h1>
                <p className="text-gray-600 mt-2 text-sm">Accédez à votre espace TechLine Care</p>
            </div>

            <div className="bg-white border rounded-lg p-6 shadow-sm">
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="email@techline-care.fr"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Mot de passe</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full border rounded px-3 py-2 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                        Se connecter
                    </button>
                </form>
            </div>
        </div>
    );
}