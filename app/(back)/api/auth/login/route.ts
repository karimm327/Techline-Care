import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/queries/auth.queries";
import { createSession } from "@/lib/db/queries/session.queries";

export async function POST(req: NextRequest) {
  const { email, password, resterConnecte } = await req.json();
  // « Rester connecté 30 jours » (facultatif) : sinon session de 24 h comme avant
  const dureeSecondes =
    resterConnecte === true ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

  if (!email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur introuvable" },
      { status: 401 },
    );
  }

  const passwordMatch = password === user.password;

  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Mot de passe incorrect" },
      { status: 401 },
    );
  }

  // Session enregistrée (liste et révocation dans Mon compte › Sécurité)
  const sid = await createSession(
    user.id_user,
    req.headers.get("user-agent"),
  ).catch(() => undefined);

  const token = jwt.sign(
    { id: user.id_user, email: user.email, role: user.role, sid },
    process.env.JWT_SECRET as string,
    { expiresIn: dureeSecondes },
  );

  const response = NextResponse.json(
    { message: "Connexion réussie", token },
    { status: 200 },
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: dureeSecondes,
    path: "/",
  });

  return response;
}
