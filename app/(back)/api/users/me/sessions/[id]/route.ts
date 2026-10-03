import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { revokeSession } from "@/lib/db/queries/session.queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Révoquer une de ses sessions (autre appareil) : son jeton est refusé immédiatement
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) {
    return NextResponse.json(
      { message: "Session introuvable" },
      { status: 404 },
    );
  }
  if (id === garde.user.sid) {
    return NextResponse.json(
      { message: "Pour fermer cette session, utilisez « Déconnexion »." },
      { status: 400 },
    );
  }
  try {
    return (await revokeSession(garde.user.id, id))
      ? NextResponse.json({ success: true })
      : NextResponse.json({ message: "Session introuvable" }, { status: 404 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
