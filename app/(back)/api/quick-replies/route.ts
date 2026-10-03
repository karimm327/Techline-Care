import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findQuickReplies } from "@/lib/db/queries/comment.queries";

// Réponses rapides proposées dans le composer — ADMIN, AGENT
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  try {
    return NextResponse.json(await findQuickReplies());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
