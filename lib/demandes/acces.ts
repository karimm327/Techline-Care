import { NextResponse } from "next/server";
import { type AuthUser, estAdmin } from "@/lib/auth";
import { findDemandById } from "@/lib/db/queries/demand.queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Demande accessible à l'utilisateur ? (supprimée : ADMIN seulement, et en lecture)
// Renvoie la demande, ou une réponse 404 / 410 prête à renvoyer.
export async function demandeAccessible(
  id: string,
  user: AuthUser,
  opts: { ecriture?: boolean } = {},
) {
  const introuvable = NextResponse.json(
    { message: "Demande introuvable" },
    { status: 404 },
  );
  if (!UUID.test(id)) return { refus: introuvable };
  const demande = await findDemandById(id);
  if (!demande) return { refus: introuvable };
  if (demande.deleted_at) {
    if (!estAdmin(user.role)) return { refus: introuvable };
    if (opts.ecriture)
      return {
        refus: NextResponse.json(
          { message: "Cette demande a été supprimée." },
          { status: 410 },
        ),
      };
  }
  return { demande };
}

export const estUuid = (v: unknown): v is string =>
  typeof v === "string" && UUID.test(v);
