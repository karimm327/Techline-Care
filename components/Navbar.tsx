"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TokenUser = { id?: string; email?: string; role?: string };

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur",
  AGENT: "Agent",
  LECTURE: "Lecture seule",
};

// Lit le contenu du token JWT (email, rôle) sans le vérifier : affichage uniquement
function lireToken(): TokenUser | null {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(payload))));
  } catch {
    return null;
  }
}

const NAVIGATION = [
  {
    titre: "Pilotage",
    liens: [
      { label: "Tableau de bord", href: "/demands", icone: "dashboard" },
      { label: "Nouvelle demande", href: "/demands/new", icone: "plus" },
    ],
  },
  {
    titre: "Mon espace",
    liens: [
      { label: "Mon compte", href: "/account", icone: "user" },
      { label: "Mes droits", href: "/account#droits", icone: "shield" },
    ],
  },
  {
    titre: "Informations",
    liens: [
      {
        label: "Politique de confidentialité",
        href: "/confidentialite",
        icone: "lock",
      },
      { label: "Mentions légales", href: "/mentions-legales", icone: "doc" },
    ],
  },
];

// Section réservée aux administrateurs
const SECTION_ADMIN = {
  titre: "Administration",
  liens: [{ label: "Journal d'activité", href: "/journal", icone: "journal" }],
};

function Icone({
  nom,
  className = "w-5 h-5",
}: {
  nom: string;
  className?: string;
}) {
  const props = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (nom) {
    case "dashboard":
      return (
        <svg aria-hidden="true" {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1.5" />
          <rect x="14" y="3" width="7" height="5" rx="1.5" />
          <rect x="14" y="12" width="7" height="9" rx="1.5" />
          <rect x="3" y="16" width="7" height="5" rx="1.5" />
        </svg>
      );
    case "plus":
      return (
        <svg aria-hidden="true" {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "user":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case "shield":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "lock":
      return (
        <svg aria-hidden="true" {...props}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "doc":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6M8 13h8M8 17h5" />
        </svg>
      );
    case "logout":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case "menu":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case "close":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      );
    case "journal":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="M3 12h4l3 8 4-16 3 8h4" />
        </svg>
      );
    case "chevron":
      return (
        <svg aria-hidden="true" {...props}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<TokenUser | null>(null);
  const [connecte, setConnecte] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const [menuCompte, setMenuCompte] = useState(false);
  const compteRef = useRef<HTMLDivElement>(null);

  // Connexion : relu à chaque changement de page (ex. juste après le login)
  // biome-ignore lint/correctness/useExhaustiveDependencies: relecture volontaire à chaque navigation
  useEffect(() => {
    const verifier = () => {
      const u = lireToken();
      setUser(u);
      setConnecte(!!localStorage.getItem("token"));
    };
    verifier();
    window.addEventListener("auth-changed", verifier);
    window.addEventListener("storage", verifier);
    return () => {
      window.removeEventListener("auth-changed", verifier);
      window.removeEventListener("storage", verifier);
    };
  }, [pathname]);

  // Ferme les menus quand on change de page
  // biome-ignore lint/correctness/useExhaustiveDependencies: fermeture volontaire à chaque navigation
  useEffect(() => {
    setTiroirOuvert(false);
    setMenuCompte(false);
  }, [pathname]);

  // Échap ferme tout + bloque le défilement quand le menu latéral est ouvert
  useEffect(() => {
    const echap = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTiroirOuvert(false);
        setMenuCompte(false);
      }
    };
    document.addEventListener("keydown", echap);
    document.body.style.overflow = tiroirOuvert ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", echap);
      document.body.style.overflow = "";
    };
  }, [tiroirOuvert]);

  // Clic en dehors du menu « Mon compte »
  useEffect(() => {
    const dehors = (e: MouseEvent) => {
      if (compteRef.current && !compteRef.current.contains(e.target as Node))
        setMenuCompte(false);
    };
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, []);

  const deconnexion = async () => {
    // Supprime le cookie de session côté serveur, puis le token du navigateur
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-changed"));
    window.location.href = "/login";
  };

  const initiale = (user?.email?.[0] ?? "U").toUpperCase();
  const role = user?.role
    ? (ROLE_LABELS[String(user.role).toUpperCase()] ?? user.role)
    : "";
  const actif = (href: string) =>
    href === "/demands"
      ? pathname === "/demands" || /^\/demands\/(?!new)/.test(pathname)
      : pathname === href;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {connecte && (
              <button
                type="button"
                onClick={() => setTiroirOuvert(true)}
                aria-label="Ouvrir le menu"
                aria-expanded={tiroirOuvert}
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Icone nom="menu" />
              </button>
            )}
            <Link
              href={connecte ? "/demands" : "/"}
              className="flex items-center gap-2.5 group"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-bold shadow-sm group-hover:bg-blue-700 transition">
                TL
              </span>
              <span className="leading-tight">
                <span className="block font-semibold text-slate-900">
                  TechLine Care
                </span>
                <span className="hidden sm:block text-[11px] uppercase tracking-wider text-slate-500">
                  Portail des demandes
                </span>
              </span>
            </Link>
          </div>

          {connecte ? (
            <div className="relative" ref={compteRef}>
              <button
                type="button"
                onClick={() => setMenuCompte((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuCompte}
                className="flex items-center gap-2.5 rounded-full sm:rounded-lg pl-1 pr-1 sm:pr-3 py-1 hover:bg-slate-100 transition"
              >
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
                  {initiale}
                </span>
                <span className="hidden sm:block text-left leading-tight">
                  <span className="block text-sm font-medium text-slate-900">
                    Mon compte
                  </span>
                  {role && (
                    <span className="block text-[11px] text-slate-500">
                      {role}
                    </span>
                  )}
                </span>
                <Icone
                  nom="chevron"
                  className={`hidden sm:block w-4 h-4 text-slate-400 transition ${menuCompte ? "rotate-180" : ""}`}
                />
              </button>

              {menuCompte && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 overflow-hidden"
                >
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {user?.email ?? "Utilisateur"}
                    </p>
                    {role && (
                      <p className="text-xs text-slate-500 mt-0.5">{role}</p>
                    )}
                  </div>
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icone nom="user" className="w-4 h-4 text-slate-400" /> Mon
                    compte
                  </Link>
                  <Link
                    href="/account#droits"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icone nom="shield" className="w-4 h-4 text-slate-400" />{" "}
                    Mes droits
                  </Link>
                  <button
                    type="button"
                    onClick={deconnexion}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100"
                  >
                    <Icone nom="logout" className="w-4 h-4" /> Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : pathname === "/login" ? (
            <a
              href="mailto:support@techline-care.fr"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
              </svg>
              Besoin d&apos;aide ?
            </a>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-sm"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* == */}
      {connecte && (
        <div
          className={`fixed inset-0 z-50 ${tiroirOuvert ? "" : "pointer-events-none"}`}
          aria-hidden={!tiroirOuvert}
        >
          {/* biome-ignore lint/a11y/noStaticElementInteractions: voile décoratif, Échap ferme aussi le tiroir */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: voile décoratif, Échap ferme aussi le tiroir */}
          <div
            onClick={() => setTiroirOuvert(false)}
            className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${tiroirOuvert ? "opacity-100" : "opacity-0"}`}
          />
          <aside
            className={`absolute left-0 top-0 h-full w-[300px] max-w-[85vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${tiroirOuvert ? "translate-x-0" : "-translate-x-full"}`}
            aria-label="Menu principal"
          >
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <span className="flex items-center gap-2.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-bold">
                  TL
                </span>
                <span className="font-semibold text-slate-900">
                  TechLine Care
                </span>
              </span>
              <button
                type="button"
                onClick={() => setTiroirOuvert(false)}
                aria-label="Fermer le menu"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
              >
                <Icone nom="close" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {(String(user?.role ?? "").toUpperCase() === "ADMIN"
                ? [NAVIGATION[0], SECTION_ADMIN, ...NAVIGATION.slice(1)]
                : NAVIGATION
              ).map((section) => (
                <div key={section.titre} className="mb-5">
                  <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {section.titre}
                  </p>
                  <ul>
                    {section.liens.map((lien) => (
                      <li key={lien.href}>
                        <Link
                          href={lien.href}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                            actif(lien.href)
                              ? "bg-blue-50 text-blue-700"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                          }`}
                        >
                          <Icone
                            nom={lien.icone}
                            className={`w-5 h-5 ${actif(lien.href) ? "text-blue-600" : "text-slate-400"}`}
                          />
                          {lien.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center">
                  {initiale}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.email ?? "Utilisateur"}
                  </p>
                  {role && <p className="text-xs text-slate-500">{role}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={deconnexion}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
              >
                <Icone nom="logout" className="w-4 h-4" /> Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
