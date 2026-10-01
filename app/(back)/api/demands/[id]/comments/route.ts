import { NextRequest, NextResponse } from "next/server";
import { createComment, findCommentsByDemandId } from "@/lib/db/queries/comment.queries";
import { findDemandById } from "@/lib/db/queries/demand.queries";
import { exigerConnexion } from "@/lib/auth";
import { logActivity } from "@/lib/db/queries/activity.queries";

// Ajouter un commentaire (utilisateur connecté obligatoire)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Connexion obligatoire + rôle LECTURE interdit
    const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
    if ("refus" in garde) return garde.refus;
    const user = garde.user;

    try {
        const body = await req.json();
        const content = typeof body.content === "string" ? body.content.trim() : "";

        if (content.length < 2) {
            return NextResponse.json({ message: "Le commentaire est trop court." }, { status: 400 });
        }
        if (content.length > 2000) {
            return NextResponse.json({ message: "Le commentaire ne doit pas dépasser 2000 caractères." }, { status: 400 });
        }

        const demand = await findDemandById(id);
        if (!demand) {
            return NextResponse.json({ message: "Demande introuvable" }, { status: 404 });
        }
        if (demand.deleted_at) {
            return NextResponse.json({ message: "Cette demande a été supprimée." }, { status: 410 });
        }

        await createComment(id, user.id, content);
        await logActivity({ action: "COMMENTAIRE", idUser: user.id, idDemand: id, details: content.length > 120 ? content.slice(0, 117) + "…" : content });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erreur serveur (comments)" }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const garde = exigerConnexion(req);
    if ("refus" in garde) return garde.refus;

    const { id } = await params;

    try {
        const result = await findCommentsByDemandId(id);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ message: "Erreur serveur (comments)" }, { status: 500 });
    }
}
