import { type NextRequest, NextResponse } from "next/server";
import { estAdmin, exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import { findDemandById, restoreDemand } from "@/lib/db/queries/demand.queries";

// Restaurer une demande supprimée (ADMIN uniquement)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  if (!estAdmin(garde.user.role)) {
    return NextResponse.json(
      { message: "Seul un administrateur peut restaurer une demande." },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const demande = await findDemandById(id);
    if (!demande) {
      return NextResponse.json(
        { message: "Demande introuvable" },
        { status: 404 },
      );
    }
    if (!demande.deleted_at) {
      return NextResponse.json(
        { message: "Cette demande n'est pas supprimée." },
        { status: 400 },
      );
    }

    await restoreDemand(id);
    await logActivity({
      action: "RESTAURATION",
      idUser: garde.user.id,
      idDemand: id,
      details: "Demande restaurée",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
