import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import {
  countAssignedDemandsByStatus,
  countCommentsByUser,
  findAssignedDemands,
  findUserById,
} from "@/lib/db/queries/user.queries";

// Informations du compte connecté + son activité
export async function GET(req: NextRequest) {
  const auth = getUserFromRequest(req);
  if (!auth) {
    return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
  }

  try {
    const user = await findUserById(auth.id);
    if (!user) {
      return NextResponse.json(
        { message: "Utilisateur introuvable" },
        { status: 404 },
      );
    }

    const [parStatut, demandes, commentaires] = await Promise.all([
      countAssignedDemandsByStatus(auth.id),
      findAssignedDemands(auth.id),
      countCommentsByUser(auth.id),
    ]);

    const stats = { total: 0, NOUVELLE: 0, EN_COURS: 0, CLOTUREE: 0 } as Record<
      string,
      number
    >;
    for (const ligne of parStatut) {
      stats[ligne.status] = ligne.total;
      stats.total += ligne.total;
    }

    return NextResponse.json({ user, stats, demandes, commentaires });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Erreur serveur (compte)" },
      { status: 500 },
    );
  }
}
