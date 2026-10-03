import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  basculerPlus1,
  findCommentById,
} from "@/lib/db/queries/comment.queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Réaction « +1 » sur un commentaire (bascule) — ADMIN, AGENT
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json(
      { message: "Commentaire introuvable" },
      { status: 404 },
    );
  }
  try {
    const commentaire = await findCommentById(id);
    if (!commentaire) {
      return NextResponse.json(
        { message: "Commentaire introuvable" },
        { status: 404 },
      );
    }
    if (commentaire.deleted_at) {
      return NextResponse.json(
        { message: "Cette demande a été supprimée." },
        { status: 410 },
      );
    }
    return NextResponse.json(await basculerPlus1(id, garde.user.id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
