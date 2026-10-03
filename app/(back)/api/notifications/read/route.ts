import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { marquerLues } from "@/lib/db/queries/notification.queries";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Marque des notifications comme lues ({ ids } ; sans ids : toutes)
export async function POST(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;

  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((x: unknown) => typeof x === "string" && UUID.test(x))
      : undefined;
    await marquerLues(garde.user.id, ids);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
