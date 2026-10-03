import { notFound, redirect } from "next/navigation";
import DeleteDemandButton from "@/components/demand/DeleteDemandButton";
import DemandForm from "@/components/demand/DemandForm";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { findPiecesJointes } from "@/lib/db/queries/attachment.queries";
import { findDemandById } from "@/lib/db/queries/demand.queries";
import { chargerOptionsFormulaire } from "@/lib/demandes/optionsFormulaire";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditDemandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const moi = await requireUser(); // connexion obligatoire
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  if (estLectureSeule(moi.role)) redirect(`/demands/${id}`); // lecture seule : pas de modification

  const [demand, options, pieces] = await Promise.all([
    findDemandById(id),
    chargerOptionsFormulaire(),
    findPiecesJointes(id).catch(() => []),
  ]);
  if (!demand) notFound();
  // Demande supprimée : plus modifiable, on renvoie vers le détail
  if (demand.deleted_at) redirect(`/demands/${id}`);

  return (
    <div className="flex flex-col gap-6">
      <DemandForm
        mode="edit"
        demandeId={id}
        options={options}
        pieces={pieces}
        moiId={moi.id}
        admin={estAdmin(moi.role)}
        initial={{
          title: demand.title,
          description: demand.description,
          id_category: demand.id_category,
          id_priority: demand.id_priority,
          id_status: demand.id_status,
          id_assigned_agent: demand.id_assigned_agent,
        }}
      />
      <div className="mx-auto w-full max-w-6xl">
        <DeleteDemandButton id={id} titre={demand.title} />
      </div>
    </div>
  );
}
