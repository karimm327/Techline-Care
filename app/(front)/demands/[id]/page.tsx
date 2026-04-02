import { notFound } from "next/navigation";
import {findDemandDetailById} from "@/lib/db/queries/demand.queries";
import {findCommentsByDemandId} from "@/lib/db/queries/comment.queries";
import Link from "next/link";
import {STATUS_STYLES} from "@/lib/types/DemandStatus";

export default async function DemandDetailPage({ params }: { params: Promise<{ id: string }>;}){

    const { id } = await params;

    const demand = await findDemandDetailById(id);

    if (!demand) {
        notFound();
    }

    const comments = await findCommentsByDemandId(id);

    return (
        <div className="max-w-3xl mx-auto p-6">

            <Link href="/demands" className="text-sm text-blue-600 hover:underline">
                ← Retour aux demandes
            </Link>

            {/* entete */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    {demand.title}
                </h1>

                <Link href={`/demands/${id}/edit`}>
                    <button className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition">
                        Modifier
                    </button>
                </Link>
            </div>

            {/* infos */}
            <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">

                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Informations
                </h2>

                <div className="space-y-3 text-sm text-gray-800">

                    <div>
                        <p className="font-medium">Description :</p>
                        <p className="text-gray-600">{demand.description}</p>
                    </div>

                    <p>
                        <span className="font-medium">Statut : </span>
                        <span
                            className={`px-2 py-1 text-xs rounded ${
                                STATUS_STYLES[demand.status] || "bg-gray-100 text-gray-700"
                            }`}
                        >
    {demand.status}
</span>
                    </p>

                    <p>
                        <span className="font-medium">Priorité :</span> {demand.priority}
                    </p>

                    <p>
                        <span className="font-medium">Catégorie :</span> {demand.category}
                    </p>

                    <p>
                        <span className="font-medium">Agent assigné :</span>{" "}
                        {demand.agent_full_name ?? (
                            <span className="text-gray-400">Non assigné</span>
                        )}
                    </p>

                    <p>
                        <span className="font-medium">Date de création :</span>{" "}
                        {new Date(demand.created_at).toLocaleDateString("fr-FR")}
                    </p>

                    {demand.updated_at && (
                        <p>
                            <span className="font-medium">Dernière modification :</span>{" "}
                            {new Date(demand.updated_at).toLocaleDateString("fr-FR")}
                        </p>
                    )}

                </div>
            </div>

            {/* commentaires */}
            <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-700">
                    Commentaires
                </h2>

                {comments.length === 0 ? (
                    <p className="text-gray-500">Aucun commentaire.</p>
                ) : (
                    <div className="space-y-4">
                        {comments.map((c, index) => (
                            <div
                                key={index}
                                className="border-t pt-3 text-sm"
                            >
                                <p className="font-medium text-gray-800">
                                    {c.author}{" "}
                                    <span className="text-gray-400">
                                ({new Date(c.created_at).toLocaleDateString("fr-FR")})
                            </span>
                                </p>

                                <p className="text-gray-600 mt-1">
                                    {c.content}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}