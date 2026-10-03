import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type AuthUser, verifierToken } from "@/lib/auth";
import { toucherSession } from "@/lib/db/queries/session.queries";

// Utilisateur connecté côté serveur (pages), lu dans le cookie httpOnly "token"
export async function getSessionUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const user = verifierToken(store.get("token")?.value);
  if (user?.sid) await toucherSession(user.sid);
  return user;
}

// À appeler en haut d'une page protégée : renvoie vers /login si personne n'est connecté
export async function requireUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
