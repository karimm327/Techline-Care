import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  COULEURS_VUE,
  countVues,
  createVue,
  findVues,
  MAX_VUES,
} from "@/lib/db/queries/view.queries";
import { normaliserRequete } from "@/lib/ui/vues";

// Vues enregistrées de l'utilisateur connecté (F7)
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    return NextResponse.json(await findVues(garde.user.id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const body = await req.json().catch(() => ({}));
    const name =
      typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
    const color = COULEURS_VUE.includes(body.color) ? body.color : "accent";
    const query = normaliserRequete(
      typeof body.query === "string" ? body.query : "",
    );
    if (name.length < 2) {
      return NextResponse.json(
        { message: "Donnez un nom d’au moins 2 caractères." },
        { status: 400 },
      );
    }
    if (!query) {
      return NextResponse.json(
        { message: "Ajoutez au moins un filtre avant d’enregistrer une vue." },
        { status: 400 },
      );
    }
    if ((await countVues(garde.user.id)) >= MAX_VUES) {
      return NextResponse.json(
        { message: `${MAX_VUES} vues au maximum : supprimez-en une d’abord.` },
        { status: 400 },
      );
    }
    const vue = await createVue(garde.user.id, { name, color, query });
    return NextResponse.json(vue, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
