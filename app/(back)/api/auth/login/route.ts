import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db/queries/auth.queries";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

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

  const token = jwt.sign(
    { id: user.id_user, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "24h" },
  );

  const response = NextResponse.json(
    { message: "Connexion réussie", token },
    { status: 200 },
  );

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
}
