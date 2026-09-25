"use client";

import { useEffect } from "react";

type Props = {
    onClose: () => void;
    userInitials?: string;
};

const menuItems = [
    {
        label: "Mes commandes & retours",
        href: "/account/orders",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        label: "Mes cartes & paiements",
        href: "/account/payments",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
        ),
    },
    {
        label: "Informations personnelles",
        href: "/account/profile",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
    {
        label: "Adresses enregistrées",
        href: "/account/addresses",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
            </svg>
        ),
    },
    {
        label: "Aide & Service client",
        href: "/account/help",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
];

let accountMenu = function AccountMenu({ onClose, userInitials = "TL" }: Props) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in">
                <div className="flex items-center px-6 py-5 border-b border-gray-200">
                    <div className="w-10 h-10 flex items-center justify-center bg-black text-white font-bold text-sm mr-3">
                        {userInitials}
                    </div>
                    <div>
                        <h2 className="font-bold text-sm uppercase tracking-wider text-black">
                            Mon Espace
                        </h2>
                        <p className="text-xs text-gray-500">Bienvenue sur votre compte</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-gray-50">
                    <ul className="m-0 p-0 list-none">
                        {menuItems.map(({ label, href, icon }) => (
                            <li key={href} className="border-b border-gray-200">

                                href={href}
                                onClick={onClose}
                                className="flex items-center justify-between px-6 py-4 hover:bg-gray-100 hover:pl-7 transition-all duration-150 no-underline"
                                >
                                <div className="flex items-center gap-3 text-black">
                                    {icon}
                                    <span className="text-sm font-medium">{label}</span>
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </a>
                            </li>
                            ))}
                    </ul>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">

                        href="/login"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black border border-black transition-colors no-underline"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        <span>Déconnexion</span>
                    </a>
                </div>
            </div>
        </div>
</div>
);
};
