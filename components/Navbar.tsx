"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Vérification de la présence du token au chargement
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
    }, []);

    return (
        <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shadow">
            <Link href="/" className="font-bold text-xl hover:text-gray-300">
                TechLine Care
            </Link>

            <div className="flex items-center gap-6">
                <Link href="/demands" className="hover:text-gray-300">
                    Demandes
                </Link>

                {isLoggedIn ? (
                    <LogoutButton />
                ) : (
                    <Link href="/login" className="hover:text-gray-300">
                        Connexion
                    </Link>
                )}
            </div>
        </nav>
    );
}