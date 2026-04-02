import DemandForm from "@/components/demand/DemandForm";
import Link from "next/link";

export default function NewDemandPage() {
    return (
        <div className="p-6 max-w-2xl mx-auto">

            <Link href="/demands" className="text-sm text-blue-600 hover:underline">
                ← Retour aux demandes
            </Link>

            <h1 className="text-2xl font-bold text-gray-800 mb-6 mt-2">
                Nouvelle demande
            </h1>

            <div className="bg-white p-6 rounded-lg shadow">
                <DemandForm
                    submitUrl="/api/demands"
                    method="POST"
                    redirectTo="/demands"
                />
            </div>

        </div>
    );
}
