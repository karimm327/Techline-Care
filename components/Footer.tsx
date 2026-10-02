import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";

const COLONNES = [
  {
    titre: "Application",
    liens: [
      { label: "Tableau de bord", href: "/demands" },
      { label: "Nouvelle demande", href: "/demands/new" },
      { label: "Mon compte", href: "/account" },
      { label: "Mes droits", href: "/account#droits" },
    ],
  },
  {
    titre: "Données & politique",
    liens: [
      { label: "Politique de confidentialité", href: "/confidentialite" },
      {
        label: "Données personnelles (RGPD)",
        href: "/confidentialite#vos-droits",
      },
      { label: "Mentions légales", href: "/mentions-legales" },
    ],
  },
];

export default async function Footer() {
  const annee = new Date().getFullYear();
  const connecte = !!(await getSessionUser());
  const colonnes = connecte
    ? COLONNES
    : COLONNES.filter((c) => c.titre !== "Application");

  return (
    <footer className="mt-auto bg-slate-900 text-slate-400">
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 sm:grid-cols-2 ${connecte ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}
      >
        {/* Présentation */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white text-sm font-bold">
              TL
            </span>
            <span className="font-semibold text-white">TechLine Care</span>
          </div>
          <p className="text-sm leading-relaxed">
            Portail interne de création, de suivi et de traitement des demandes
            de support.
          </p>
        </div>

        {colonnes.map((col) => (
          <div key={col.titre}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              {col.titre}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {col.liens.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/*  */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
            Service support
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <svg
                aria-hidden="true"
                className="w-4 h-4 mt-0.5 shrink-0 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <a
                href="mailto:support@techline-care.fr"
                className="hover:text-white transition"
              >
                support@techline-care.fr
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                aria-hidden="true"
                className="w-4 h-4 mt-0.5 shrink-0 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>
                Du lundi au vendredi
                <br />9 h – 18 h
              </span>
            </li>
            {connecte && (
              <li className="flex items-start gap-2.5">
                <svg
                  aria-hidden="true"
                  className="w-4 h-4 mt-0.5 shrink-0 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <Link
                  href="/demands/new"
                  className="hover:text-white transition"
                >
                  Signaler un problème
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {annee} TechLine Care. Tous droits réservés.</p>
          <div className="flex items-center gap-5">
            <Link
              href="/confidentialite"
              className="hover:text-white transition"
            >
              Confidentialité
            </Link>
            <Link
              href="/mentions-legales"
              className="hover:text-white transition"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
