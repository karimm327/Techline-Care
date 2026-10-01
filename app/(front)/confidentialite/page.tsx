import Link from "next/link";

export const metadata = { title: "Politique de confidentialité - TechLine Care" };

const SECTIONS = [
    {
        id: "donnees",
        titre: "Données collectées",
        texte: "Nom, prénom, adresse e-mail professionnelle et rôle des utilisateurs, ainsi que le contenu des demandes et des commentaires saisis dans l'application.",
    },
    {
        id: "finalites",
        titre: "Pourquoi nous les utilisons",
        texte: "Authentifier les utilisateurs, créer, suivre et traiter les demandes de support, assigner les agents et conserver un historique des actions.",
    },
    {
        id: "conservation",
        titre: "Durée de conservation",
        texte: "Les données sont conservées pendant la durée d'utilisation du compte, puis supprimées ou anonymisées dans un délai raisonnable.",
    },
    {
        id: "securite",
        titre: "Sécurité",
        texte: "L'accès est protégé par une authentification par jeton (JWT). Seules les personnes autorisées selon leur rôle peuvent consulter ou modifier les demandes.",
    },
    {
        id: "vos-droits",
        titre: "Vos droits (RGPD)",
        texte: "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à support@techline-care.fr. Vous pouvez également saisir la CNIL (www.cnil.fr).",
    },
];

export default function ConfidentialitePage() {
    return (
        <div className="bg-slate-50 min-h-full">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                <Link href="/demands" className="text-sm text-blue-600 hover:underline">← Retour</Link>
                <h1 className="text-2xl font-semibold text-slate-900 mt-3">Politique de confidentialité</h1>
                <p className="text-sm text-slate-500 mt-1 mb-8">Comment TechLine Care traite vos données personnelles.</p>
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-100">
                    {SECTIONS.map((s) => (
                        <section key={s.id} id={s.id} className="p-6 scroll-mt-20">
                            <h2 className="text-base font-semibold text-slate-900 mb-2">{s.titre}</h2>
                            <p className="text-sm text-slate-600 leading-relaxed">{s.texte}</p>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
