import {notFound} from "next/navigation";
import {findDemandById} from "@/lib/db/queries/demand.queries";
import DemandForm from "@/components/demand/DemandForm";
import Link from "next/link";

export default async function EditDemandPage({params}: { params: Promise<{ id: string }> }) {
    const {id} = await params;

    const demand = await findDemandById(id);

    if (!demand) {
        notFound();
    }

    return (
        <div className="p-6 max-w-2xl mx-auto">

            <Link href={`/demands/${id}`} className="text-sm text-blue-600 hover:underline">
                ← Retour aux détail demandes
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-6 mt-2">
                Modifier la demande
            </h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <DemandForm
                    submitUrl={`/api/demands/${id}`}
                    method="PUT"
                    redirectTo={`/demands/${id}`}
                    initialData={demand}
                />
            </div>

        </div>
    );
}
