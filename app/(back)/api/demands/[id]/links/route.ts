import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import {
  delierDemandes,
  findDemandesLiees,
  lierDemandes,
  trouverParReference,
} from "@/lib/db/queries/suivi.queries";
import { demandeAccessible, estUuid } from "@/lib/demandes/acces";
import { reference } from "@/lib/ui/format";

type Contexte = { params: Promise<{ id: string }> };

// Demandes liées (F11)
export async function GET(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user);
  if ("refus" in acces) return acces.refus;
  return NextResponse.json(await findDemandesLiees(id));
}

// Lier : { cible: "#7B20E1AA" | identifiant, kind: "LIEE" | "DOUBLON" } — ADMIN, AGENT
export async function POST(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user, { ecriture: true });
  if ("refus" in acces) return acces.refus;

  const body = await req.json().catch(() => ({}));
  const kind = body.kind === "DOUBLON" ? "DOUBLON" : "LIEE";
  const autre =
    typeof body.cible === "string"
      ? await trouverParReference(body.cible)
      : null;
  if (!autre)
    return NextResponse.json(
      { message: "Référence introuvable (ex. #7B20E1AA)." },
      { status: 400 },
    );
  if (autre === id)
    return NextResponse.json(
      { message: "Une demande ne peut pas être liée à elle-même." },
      { status: 400 },
    );
  try {
    await lierDemandes(id, autre, kind, garde.user.id);
    await logActivity({
      action: "MODIFICATION",
      idUser: garde.user.id,
      idDemand: id,
      details: `${kind === "DOUBLON" ? "Marquée comme doublon de" : "Liée à"} ${reference(autre)}`,
    }).catch((e) => console.error(e));
    return NextResponse.json(await findDemandesLiees(id), { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

// Délier : { cible: identifiant } — ADMIN, AGENT
export async function DELETE(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user, { ecriture: true });
  if ("refus" in acces) return acces.refus;
  const body = await req.json().catch(() => ({}));
  if (!estUuid(body.cible))
    return NextResponse.json(
      { message: "Demande liée manquante." },
      { status: 400 },
    );
  try {
    await delierDemandes(id, body.cible);
    return NextResponse.json(await findDemandesLiees(id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
