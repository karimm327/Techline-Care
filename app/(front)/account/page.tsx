"use client";

import Link from "next/link";

const menuItems = [
    { label: "Mes demandes", href: "/" },
    { label: "Informations personnelles", href: "/a" },
    { label: "historique de demande", href: "/" },
    { label: "Aide & Service client", href: "/" },
];

export default function AccountDashboard() {
    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Mon espace</h1>
                <p className="text-sm text-gray-500">Bienvenue sur votre compte</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
                {menuItems.map(({ label, href }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition"
                    >
                        <span className="text-sm text-gray-800">{label}</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-gray-400"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </Link>
                ))}
            </div>
        </div>
    );
}