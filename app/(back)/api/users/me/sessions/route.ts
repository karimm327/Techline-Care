import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findSessions } from "@/lib/db/queries/session.queries";

// Sessions actives de l'utilisateur connecté ; « actuelle » = celle de ce navigateur
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const sessions = await findSessions(garde.user.id);
    return NextResponse.json(
      sessions.map((s) => ({ ...s, actuelle: s.id === garde.user.sid })),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
