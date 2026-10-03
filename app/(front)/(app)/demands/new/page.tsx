import { redirect } from "next/navigation";
import DemandForm from "@/components/demand/DemandForm";
import { estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { chargerOptionsFormulaire } from "@/lib/demandes/optionsFormulaire";

// ?titre= : titre pré-rempli (action « Créer une demande « … » » de la palette Ctrl K)
export default async function NewDemandPage({
  searchParams,
}: {
  searchParams: Promise<{ titre?: string }>;
}) {
  const moi = await requireUser(); // connexion obligatoire
  if (estLectureSeule(moi.role)) redirect("/demands"); // lecture seule : pas de création

  const options = await chargerOptionsFormulaire();
  const { titre } = await searchParams;
  return (
    <DemandForm
      mode="new"
      options={options}
      titreSuggere={titre?.slice(0, 200)}
    />
  );
}
