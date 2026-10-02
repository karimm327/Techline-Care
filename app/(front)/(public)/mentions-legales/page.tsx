import Link from "next/link";

export const metadata = { title: "Mentions légales - TechLine Care" };

export default function MentionsLegalesPage() {
  return (
    <div className="bg-slate-50 min-h-full">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/demands" className="text-sm text-blue-600 hover:underline">
          ← Retour
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-3 mb-8">
          Mentions légales
        </h1>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6 text-sm text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Éditeur
            </h2>
            <p>
              TechLine Care — application interne de gestion des demandes de
              support, réalisée dans le cadre d'un projet de formation.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Contact
            </h2>
            <p>support@techline-care.fr</p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Hébergement
            </h2>
            <p>
              Base de données PostgreSQL hébergée sur le serveur de
              l'établissement de formation.
            </p>
          </section>
          <section>
            <h2 className="text-base font-semibold text-slate-900 mb-2">
              Données personnelles
            </h2>
            <p>
              Voir la{" "}
              <Link
                href="/confidentialite"
                className="text-blue-600 hover:underline"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
