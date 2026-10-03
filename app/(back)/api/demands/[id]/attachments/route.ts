import { type NextRequest, NextResponse } from "next/server";
import { estAdmin, exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import {
  createPieceJointe,
  findPiecesJointes,
} from "@/lib/db/queries/attachment.queries";
import { findDemandById } from "@/lib/db/queries/demand.queries";
import {
  detecterType,
  enregistrerFichier,
  nomPropre,
  TAILLE_MAX,
} from "@/lib/fichiers";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const message = (texte: string, status: number) =>
  NextResponse.json({ message: texte }, { status });

// Pièces jointes d'une demande (tous les rôles connectés ; demande supprimée : ADMIN)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return message("Demande introuvable", 404);
  try {
    const demande = await findDemandById(id);
    if (!demande || (demande.deleted_at && !estAdmin(garde.user.role)))
      return message("Demande introuvable", 404);
    return NextResponse.json(await findPiecesJointes(id));
  } catch (error) {
    console.error(error);
    return message("Erreur serveur", 500);
  }
}

// Ajout d'une pièce jointe (multipart, champ « fichier ») — ADMIN, AGENT
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return message("Demande introuvable", 404);

  try {
    const demande = await findDemandById(id);
    if (!demande) return message("Demande introuvable", 404);
    if (demande.deleted_at)
      return message("Cette demande a été supprimée.", 410);

    const formulaire = await req.formData().catch(() => null);
    const fichier = formulaire?.get("fichier");
    if (!(fichier instanceof File)) return message("Aucun fichier reçu.", 400);
    if (fichier.size === 0) return message("Le fichier est vide.", 400);
    if (fichier.size > TAILLE_MAX)
      return message("Fichier trop lourd : 10 Mo au maximum.", 413);

    const octets = new Uint8Array(await fichier.arrayBuffer());
    const type = detecterType(octets);
    if (!type)
      return message(
        "Format non accepté : PDF, PNG, JPG ou WEBP uniquement.",
        415,
      );

    const cle = await enregistrerFichier(octets, type);
    const piece = await createPieceJointe({
      idDemand: id,
      idUploader: garde.user.id,
      fileName: nomPropre(fichier.name),
      mimeType: type,
      sizeBytes: fichier.size,
      storageKey: cle,
    });
    await logActivity({
      action: "PIECE_JOINTE",
      idUser: garde.user.id,
      idDemand: id,
      details: `Fichier ajouté : ${piece.file_name}`,
    }).catch((e) => console.error(e));
    return NextResponse.json(piece, { status: 201 });
  } catch (error) {
    console.error(error);
    return message("Erreur serveur", 500);
  }
}
