import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  rechercherDemandes,
  rechercherPersonnes,
} from "@/lib/db/queries/search.queries";
import { reference } from "@/lib/ui/format";

// Recherche rapide pour la palette Ctrl K (tous les rôles connectés)
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) {
    return NextResponse.json({ demandes: [], personnes: [] });
  }
  try {
    const [demandes, personnes] = await Promise.all([
      rechercherDemandes(q, 10),
      rechercherPersonnes(q, 5),
    ]);
    return NextResponse.json({
      demandes: demandes.map((d) => ({ ...d, ref: reference(d.id) })),
      personnes,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
