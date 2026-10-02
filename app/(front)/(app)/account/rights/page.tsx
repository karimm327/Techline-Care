import { redirect } from "next/navigation";

// Ancienne page des droits : la matrice est désormais un onglet du compte
export default function RightsPage() {
  redirect("/account?onglet=droits");
}
