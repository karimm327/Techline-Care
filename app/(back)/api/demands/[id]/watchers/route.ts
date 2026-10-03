import { type NextRequest, NextResponse } from "next/server";
import { estAdmin, exigerConnexion } from "@/lib/auth";
import {
  ajouterAbonne,
  findAbonnes,
  retirerAbonne,
} from "@/lib/db/queries/suivi.queries";
import { demandeAccessible, estUuid } from "@/lib/demandes/acces";

type Contexte = { params: Promise<{ id: string }> };

// Abonnés d'une demande (F11) : créateur, agent et abonnés explicites
export async function GET(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user);
  if ("refus" in acces) return acces.refus;
  return NextResponse.json(await findAbonnes(id));
}

// Suivre : soi-même, ou une autre personne pour un ADMIN ({ userId })
async function cible(req: NextRequest, moi: { id: string; role: string }) {
  const body = await req.json().catch(() => ({}));
  if (body.userId === undefined || body.userId === moi.id) return moi.id;
  if (!estAdmin(moi.role) || !estUuid(body.userId)) return null;
  return body.userId as string;
}

export async function POST(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user, { ecriture: true });
  if ("refus" in acces) return acces.refus;
  const qui = await cible(req, garde.user);
  if (!qui)
    return NextResponse.json(
      { message: "Action non autorisée" },
      { status: 403 },
    );
  try {
    await ajouterAbonne(id, qui);
    return NextResponse.json(await findAbonnes(id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Contexte) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  const acces = await demandeAccessible(id, garde.user);
  if ("refus" in acces) return acces.refus;
  const qui = await cible(req, garde.user);
  if (!qui)
    return NextResponse.json(
      { message: "Action non autorisée" },
      { status: 403 },
    );
  try {
    await retirerAbonne(id, qui);
    return NextResponse.json(await findAbonnes(id));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
