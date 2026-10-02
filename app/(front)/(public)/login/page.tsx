import { redirect } from "next/navigation";
import ConnexionForm from "@/components/auth/ConnexionForm";
import { getSessionUser } from "@/lib/auth/session";

const ATOUTS = [
  {
    titre: "Suivi en temps réel",
    texte:
      "Chaque demande avance de Nouvelle à Clôturée, avec son historique complet.",
    icone: <path d="M3 12h4l3 8 4-16 3 8h4" />,
  },
  {
    titre: "Assignation aux agents",
    texte:
      "Les demandes sont confiées au bon agent et priorisées selon l'urgence.",
    icone: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
  },
  {
    titre: "Traçabilité",
    texte:
      "Créations, modifications et suppressions sont enregistrées dans le journal.",
    icone: (
      <>
        <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
];

export default async function LoginPage() {
  // Déjà connecté : directement au tableau de bord
  if (await getSessionUser()) redirect("/demands");

  return (
    <div className="min-h-full grid lg:grid-cols-2">
      {/* Présentation */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white px-6 sm:px-12 py-12 lg:py-16 flex flex-col justify-center">
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-500/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[2px] text-blue-300">
            Portail interne
          </p>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight">
            Gérez et suivez toutes les demandes de support au même endroit.
          </h1>
          <p className="mt-4 text-blue-100/80">
            TechLine Care centralise la création, le traitement et le suivi des
            demandes de vos équipes.
          </p>

          <ul className="mt-10 space-y-6 hidden sm:block">
            {ATOUTS.map((a) => (
              <li key={a.titre} className="flex gap-4">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-blue-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {a.icone}
                  </svg>
                </span>
                <div>
                  <p className="font-semibold">{a.titre}</p>
                  <p className="text-sm text-blue-100/70 mt-0.5">{a.texte}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Connexion */}
      <section className="bg-slate-50 px-6 sm:px-12 py-12 lg:py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Connexion</h2>
            <p className="text-sm text-slate-500 mt-1">
              Accédez à votre espace avec votre adresse professionnelle.
            </p>
          </div>
          <ConnexionForm />
          <p className="mt-8 text-xs text-slate-500 text-center">
            Accès réservé au personnel. Un problème pour vous connecter ?{" "}
            <a
              href="mailto:support@techline-care.fr"
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              Contactez le support
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
