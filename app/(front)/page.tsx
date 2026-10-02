import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

// Accueil : connecté → tableau de bord, sinon → page de connexion
export default async function HomePage() {
  const user = await getSessionUser();
  redirect(user ? "/demands" : "/login");
}
