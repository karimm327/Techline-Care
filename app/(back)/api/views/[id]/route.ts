import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  COULEURS_VUE,
  deleteVue,
  updateVue,
} from "@/lib/db/queries/view.queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const introuvable = () =>
  NextResponse.json({ message: "Vue introuvable" }, { status: 404 });

// Renommer, changer la couleur ou la position d'une vue (propriétaire uniquement)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return introuvable();
  try {
    const body = await req.json().catch(() => ({}));
    const ok = await updateVue(garde.user.id, id, {
      name:
        typeof body.name === "string" && body.name.trim().length >= 2
          ? body.name.trim().slice(0, 60)
          : undefined,
      color: COULEURS_VUE.includes(body.color) ? body.color : undefined,
      position: Number.isInteger(body.position) ? body.position : undefined,
    });
    return ok ? NextResponse.json({ success: true }) : introuvable();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return introuvable();
  try {
    return (await deleteVue(garde.user.id, id))
      ? NextResponse.json({ success: true })
      : introuvable();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
