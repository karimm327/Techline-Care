"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        // Vérification au chargement
        checkToken();

        // Mise à jour immédiate quand le token change dans le même onglet
        // (déclenché après login/logout via window.dispatchEvent)
        window.addEventListener("auth-changed", checkToken);

        // Mise à jour si le token change dans un autre onglet
        window.addEventListener("storage", checkToken);

        return () => {
            window.removeEventListener("auth-changed", checkToken);
            window.removeEventListener("storage", checkToken);
        };
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-lg text-white hover:text-blue-400 transition"
                >
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-sm">
                        TL
                    </span>
                    TechLine Care
                </Link>

                <div className="flex items-center gap-4">
                    {isLoggedIn ? (
                        <LogoutButton />
                    ) : (
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
                        >
                            Connexion
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}