import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  findPreferences,
  nettoyerPreferences,
  updatePreferences,
} from "@/lib/db/queries/preference.queries";

// Préférences de l'utilisateur connecté (F14)
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    return NextResponse.json(await findPreferences(garde.user.id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const body = await req.json().catch(() => ({}));
    const changements = nettoyerPreferences(body);
    if (Object.keys(changements).length === 0) {
      return NextResponse.json(
        { message: "Aucune préférence valide." },
        { status: 400 },
      );
    }
    return NextResponse.json(
      await updatePreferences(garde.user.id, changements),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
