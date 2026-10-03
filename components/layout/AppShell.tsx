import type { ReactNode } from "react";
import { estAdmin, estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { findUserById } from "@/lib/db/queries/user.queries";
import { findVues } from "@/lib/db/queries/view.queries";
import AppFooter from "./AppFooter";
import CadreApp from "./CadreApp";
import { LIBELLES_ROLE } from "./navigation";
import type { UtilisateurShell } from "./types";

// Cadre de l'application (Server Component) : l'utilisateur vient du cookie de session,
// jamais du navigateur. Redirige vers /login si personne n'est connecté.
export default async function AppShell({ children }: { children: ReactNode }) {
  const session = await requireUser();
  const [profil, vues] = await Promise.all([
    findUserById(session.id).catch(() => null),
    findVues(session.id).catch(() => []),
  ]);

  const nom =
    `${profil?.first_name ?? ""} ${profil?.last_name ?? ""}`.trim() ||
    session.email;
  const utilisateur: UtilisateurShell = {
    id: session.id,
    nom,
    email: profil?.email ?? session.email,
    role: session.role,
    libelleRole: LIBELLES_ROLE[session.role] ?? session.role,
    estAdmin: estAdmin(session.role),
    lectureSeule: estLectureSeule(session.role),
  };

  return (
    <CadreApp utilisateur={utilisateur} vues={vues} footer={<AppFooter />}>
      {children}
    </CadreApp>
  );
}
