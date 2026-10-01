import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { findUserPassword, updateUserPassword } from "@/lib/db/queries/user.queries";

// Changer son mot de passe
export async function PUT(req: NextRequest) {
    const auth = getUserFromRequest(req);
    if (!auth) {
        return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    try {
        const { actuel, nouveau } = await req.json();

        if (!actuel || !nouveau) {
            return NextResponse.json({ message: "Tous les champs sont obligatoires." }, { status: 400 });
        }
        if (nouveau.length < 8 || !/[A-Z]/.test(nouveau) || !/\d/.test(nouveau)) {
            return NextResponse.json({ message: "8 caractères minimum, dont 1 majuscule et 1 chiffre." }, { status: 400 });
        }

        const enregistre = await findUserPassword(auth.id);
        // Même vérification que la connexion (mots de passe stockés tels quels dans ce projet)
        if (enregistre === null || enregistre !== actuel) {
            return NextResponse.json({ message: "Mot de passe actuel incorrect." }, { status: 400 });
        }

        await updateUserPassword(auth.id, nouveau);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
