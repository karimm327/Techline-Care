import { redirect } from "next/navigation";
import DemandForm from "@/components/demand/DemandForm";
import { estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { chargerOptionsFormulaire } from "@/lib/demandes/optionsFormulaire";

export default async function NewDemandPage() {
  const moi = await requireUser(); // connexion obligatoire
  if (estLectureSeule(moi.role)) redirect("/demands"); // lecture seule : pas de création

  const options = await chargerOptionsFormulaire();
  return <DemandForm mode="new" options={options} />;
}
