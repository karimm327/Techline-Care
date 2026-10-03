import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  findStatistiques,
  PERIODES,
  type Periode,
} from "@/lib/db/queries/stats.queries";

// Statistiques de l'équipe (F13) — ADMIN, AGENT ; ?periode=7|14|30|90
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const demande = Number(req.nextUrl.searchParams.get("periode") ?? 30);
  const periode = (PERIODES as readonly number[]).includes(demande)
    ? (demande as Periode)
    : 30;
  try {
    return NextResponse.json(await findStatistiques(periode));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
