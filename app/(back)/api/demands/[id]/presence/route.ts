import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findPresents, signalerPresence } from "@/lib/db/queries/suivi.queries";
import { demandeAccessible } from "@/lib/demandes/acces";

type Contexte = { params: Promise<{ id: string }> };

// Présence sur une fiche (F12) : signal toutes les 15 s, « TYPING » pendant la frappe.
// Renvoie les autres personnes présentes (tous les rôles connectés).
export async function POST(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user);
  if ("refus" in acces) return acces.refus;
  const body = await req.json().catch(() => ({}));
  const etat = body.state === "TYPING" ? "TYPING" : "VIEW";
  try {
    await signalerPresence(garde.user.id, id, etat);
    return NextResponse.json(await findPresents(id, garde.user.id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user);
  if ("refus" in acces) return acces.refus;
  return NextResponse.json(await findPresents(id, garde.user.id));
}
