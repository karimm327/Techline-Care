import DemandForm from "@/components/demand/DemandForm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { estLectureSeule } from "@/lib/auth";

export default async function NewDemandPage() {
    const moi = await requireUser(); // connexion obligatoire
    if (estLectureSeule(moi.role)) redirect("/demands"); // lecture seule : pas de création

    return (
        <div className="min-h-full bg-[whitesmoke]">
            {/* Bandeau */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16">
                    <Link href="/demands" className="inline-flex items-center gap-1.5 text-sm text-blue-100 hover:text-white transition">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                        Retour aux demandes
                    </Link>
                    <div className="mt-5 flex items-center gap-4">
                        {/* Logo « demande » */}
                        <span className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur flex items-center justify-center shadow-lg">
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
                                <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
                                <path d="M12 10v6M9 13h6" />
                            </svg>
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 ring-2 ring-indigo-600 flex items-center justify-center text-[11px] font-bold text-emerald-950">+</span>
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-white">Nouvelle demande</h1>
                            <p className="text-sm text-blue-100 mt-1">Renseigne les informations : la demande sera créée avec le statut « Nouvelle ».</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 pb-12">
                <DemandForm submitUrl="/api/demands" method="POST" redirectTo="/demands" />
            </div>
        </div>
    );
}
