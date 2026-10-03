import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findEquipeEnLigne } from "@/lib/db/queries/suivi.queries";

// « Équipe en ligne » de la sidebar (F12) : actifs depuis moins de 5 minutes
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    return NextResponse.json(await findEquipeEnLigne());
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
