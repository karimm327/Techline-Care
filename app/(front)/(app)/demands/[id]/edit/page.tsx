import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DeleteDemandButton from "@/components/demand/DeleteDemandButton";
import DemandForm from "@/components/demand/DemandForm";
import { estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { findDemandById } from "@/lib/db/queries/demand.queries";

export default async function EditDemandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const moi = await requireUser(); // connexion obligatoire
  const { id } = await params;
  if (estLectureSeule(moi.role)) redirect(`/demands/${id}`); // lecture seule : pas de modification

  const demand = await findDemandById(id);

  if (!demand) {
    notFound();
  }
  // Demande supprimée : plus modifiable, on renvoie vers le détail
  if (demand.deleted_at) redirect(`/demands/${id}`);

  return (
    <div className="min-h-full bg-[whitesmoke]">
      {/* Bandeau */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-16">
          <Link
            href={`/demands/${id}`}
            className="inline-flex items-center gap-1.5 text-sm text-blue-100 hover:text-white transition"
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Retour au détail
          </Link>
          <div className="mt-5 flex items-center gap-4">
            {/* Logo « demande » */}
            <span className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur flex items-center justify-center shadow-lg">
              <svg
                aria-hidden="true"
                className="w-7 h-7 sm:w-8 sm:h-8 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
                <rect x="9" y="2.5" width="6" height="3.5" rx="1" />
                <path d="M9 12h6M9 16h4" />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-400 ring-2 ring-indigo-600 flex items-center justify-center">
                <svg
                  aria-hidden="true"
                  className="w-3 h-3 text-amber-950"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
                </svg>
              </span>
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                Demande #{id.slice(0, 8).toUpperCase()}
              </p>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">
                Modifier la demande
              </h1>
              <p className="text-sm text-blue-100 mt-1 truncate">
                {demand.title}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-10 pb-12">
        <DemandForm
          submitUrl={`/api/demands/${id}`}
          method="PUT"
          redirectTo={`/demands/${id}`}
          initialData={demand}
        />
        <DeleteDemandButton id={id} titre={demand.title} />
      </div>
    </div>
  );
}
