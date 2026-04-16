import Link from "next/link";
import { findAllDemands } from "@/lib/db/queries/demand.queries";

export default async function DemandsPage() {
    try {
        const demands = await findAllDemands();

        if (!demands || demands.length === 0) {
            return (
                <>
                    <h1>Demandes</h1>
                    <Link href="/demands/new">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">+ Nouvelle demande</button>
                    </Link>

                    <p>Aucune demande enregistrée.</p>
                </>
            );
        }

        return (
            <>
                <div className="items-center mb-6">

                    <h1 className="text-2xl font-semibold">
                        Demandes
                    </h1>

                    <Link href="/demands/new">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                            + Nouvelle demande
                        </button>
                    </Link>

                </div>

                <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left p-3">Titre</th>
                        <th className="text-left p-3">Date de création</th>
                        <th className="text-left p-3">Statut</th>
                        <th className="text-left p-3">Priorité</th>
                        <th className="text-left p-3">Catégorie</th>
                        <th className="text-left p-3">Agent assigné</th>
                        <th className="text-left p-3">Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {demands.map((d) => (
                        <tr key={d.id_demand} className="border-t hover:bg-gray-50 transition">
                            <td className="p-3">
                                <Link href={`/demands/${d.id_demand}`} className="text-blue-600 hover:underline">
                                    {d.title}
                                </Link>
                            </td>

                            <td className="p-3">
                                {new Date(d.created_at).toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </td>

                            <td className="p-3">{d.status}</td>
                            <td className="p-3">{d.priority}</td>
                            <td className="p-3">{d.category}</td>

                            <td className="p-3">
                                {d.agent_full_name
                                    ? d.agent_full_name
                                    : "Non assigné"}
                            </td>

                            <td className="p-3">
                                <Link
                                    href={`/demands/${d.id_demand}/edit`}
                                    className="text-blue-600 hover:underline"
                                >
                                    Modifier
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </>
        );


    } catch (error) {
        console.error(error);

        return (
            <>
                <h1>Demandes</h1>
                <p>Erreur lors du chargement des demandes.</p>
            </>
        );
    }


}