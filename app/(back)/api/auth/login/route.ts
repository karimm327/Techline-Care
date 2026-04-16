import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/queries/auth.queries";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 401 });
    }

    const passwordMatch = password === user.password;

    if (!passwordMatch) {
        return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = jwt.sign(
        { id: user.id_user, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "24h" }
    );

    return NextResponse.json({ message: "Connexion réussie", token }, { status: 200 });
}