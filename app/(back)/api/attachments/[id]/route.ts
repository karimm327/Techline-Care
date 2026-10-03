import { type NextRequest, NextResponse } from "next/server";
import { estAdmin, exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";
import {
  findPieceJointe,
  softDeletePieceJointe,
} from "@/lib/db/queries/attachment.queries";
import { lireFichier } from "@/lib/fichiers";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const introuvable = () =>
  NextResponse.json({ message: "Fichier introuvable" }, { status: 404 });

// Téléchargement : accès = accès à la demande (supprimée : ADMIN uniquement)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return introuvable();
  try {
    const p = await findPieceJointe(id);
    if (!p || p.deleted_at) return introuvable();
    if (p.demande_supprimee && !estAdmin(garde.user.role)) return introuvable();

    const contenu = await lireFichier(p.storage_key);
    // Images et PDF affichés dans le navigateur, sinon téléchargés
    const telecharger = req.nextUrl.searchParams.get("telecharger") === "1";
    const nom = encodeURIComponent(p.file_name);
    return new NextResponse(new Uint8Array(contenu), {
      headers: {
        "Content-Type": p.mime_type,
        "Content-Length": String(contenu.length),
        "Content-Disposition": `${telecharger ? "attachment" : "inline"}; filename*=UTF-8''${nom}`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error(error);
    return introuvable();
  }
}

// Suppression (douce) : auteur du fichier ou ADMIN
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;
  const { id } = await params;
  if (!UUID.test(id)) return introuvable();
  try {
    const p = await findPieceJointe(id);
    if (!p || p.deleted_at) return introuvable();
    if (p.id_uploader !== garde.user.id && !estAdmin(garde.user.role)) {
      return NextResponse.json(
        {
          message:
            "Seul l’auteur du fichier ou un administrateur peut le retirer.",
        },
        { status: 403 },
      );
    }
    await softDeletePieceJointe(id);
    await logActivity({
      action: "PIECE_JOINTE",
      idUser: garde.user.id,
      idDemand: p.id_demand,
      details: `Fichier retiré : ${p.file_name}`,
    }).catch((e) => console.error(e));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
