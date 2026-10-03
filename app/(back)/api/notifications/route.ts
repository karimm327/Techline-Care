import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import {
  countNonLues,
  findNotifications,
  genererNotificationsSla,
} from "@/lib/db/queries/notification.queries";

const ONGLETS = ["tout", "mentions", "assignees"];

// Notifications de l'utilisateur connecté (30 dernières) + nombre de non lues
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;

  const demande = req.nextUrl.searchParams.get("onglet") ?? "tout";
  const onglet = ONGLETS.includes(demande) ? demande : "tout";
  try {
    // Échéances SLA vérifiées à chaque lecture (pas de tâche planifiée)
    await genererNotificationsSla(garde.user.id).catch((e) =>
      console.error("SLA :", (e as Error).message),
    );
    const [notifications, nonLues] = await Promise.all([
      findNotifications(garde.user.id, onglet),
      countNonLues(garde.user.id),
    ]);
    return NextResponse.json({ notifications, nonLues });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
