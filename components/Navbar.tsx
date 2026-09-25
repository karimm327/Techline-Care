"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import LogoutButton from "./LogoutButton";

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        checkToken();

        window.addEventListener("auth-changed", checkToken);
        window.addEventListener("storage", checkToken);

        return () => {
            window.removeEventListener("auth-changed", checkToken);
            window.removeEventListener("storage", checkToken);
        };
    }, []);

    // Ferme le dropdown si on clique en dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <>
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setMenuOpen((v) => !v)}
                                    className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-800 hover:bg-gray-700 transition text-white"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="w-5 h-5"
                                    >
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                </button>

                                {menuOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                                        <Link
                                            href="/account"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-50 transition"
                                        >
                                            Mon compte
                                        </Link>
                                        <Link
                                            href="/account/rights"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-4 py-3 text-sm hover:bg-gray-50 transition border-t border-gray-100"
                                        >
                                            Mes droits
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <LogoutButton />
                        </>
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