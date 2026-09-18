import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/queries/auth.queries";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email et mot de passe requis" },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);

        if (!user) {
            return NextResponse.json(
                { error: "Email ou mot de passe incorrect" },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Email ou mot de passe incorrect" },
                { status: 401 }
            );
        }

        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error("JWT_SECRET n'est pas configuré");

            return NextResponse.json(
                { error: "Erreur de configuration serveur" },
                { status: 500 }
            );
        }

        const token = jwt.sign(
            {
                id: user.id_user,
                email: user.email,
                role: user.role,
            },
            secret,
            {
                expiresIn: "24h",
            }
        );

        const response = NextResponse.json(
            {
                message: "Connexion réussie",
            },
            { status: 200 }
        );

        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        console.error("Erreur login :", error);

        return NextResponse.json(
            { error: "Erreur interne du serveur" },
            { status: 500 }
        );
    }
}
