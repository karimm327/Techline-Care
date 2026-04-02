import Link from "next/link";

export default function HomePage() {
    return (
        <div className="max-w-3xl mx-auto p-6">

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Portail interne - TechLine Care
                </h1>
                <p className="text-gray-600 mt-2">
                    Application interne de gestion et de suivi des demandes.
                </p>
            </div>

            <div className="bg-white border rounded-lg p-6 shadow-sm">

                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Accès rapide
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                    Gérez les demandes, suivez leur évolution et assignez-les aux agents.
                </p>

                <div className="flex gap-4">

                    <Link href="/demands">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            Voir les demandes
                        </button>
                    </Link>

                    <Link href="/demands/new">
                        <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">
                            Créer une demande
                        </button>
                    </Link>

                </div>
            </div>

        </div>
    );
}