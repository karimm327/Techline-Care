import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { secretJwt } from "@/lib/auth";
import {
  adresseClient,
  attenteAvantNouvelEssai,
  effacerEchecs,
  noterEchec,
} from "@/lib/auth/limiteur";
import { hacherMotDePasse, verifierMotDePasse } from "@/lib/auth/motDePasse";
import { findUserByEmail } from "@/lib/db/queries/auth.queries";
import { createSession } from "@/lib/db/queries/session.queries";
import { updateUserPassword } from "@/lib/db/queries/user.queries";

export async function POST(req: NextRequest) {
  const { email, password, resterConnecte } = await req
    .json()
    .catch(() => ({}));
  // « Rester connecté 30 jours » (facultatif) : sinon session de 24 h comme avant
  const dureeSecondes =
    resterConnecte === true ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

  if (!email || !password) {
    return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
  }

  // Trop d'échecs récents pour cette IP et cette adresse : blocage temporaire (force brute)
  const ip = adresseClient(req.headers);
  const attente = attenteAvantNouvelEssai(ip, String(email));
  if (attente > 0) {
    return NextResponse.json(
      {
        error: `Trop de tentatives. Réessayez dans ${Math.ceil(attente / 60)} min.`,
      },
      { status: 429, headers: { "Retry-After": String(attente) } },
    );
  }

  const user = await findUserByEmail(email);

  // Même réponse (et même durée) que l'adresse existe ou non : n'aide pas à deviner les comptes
  const verification = await verifierMotDePasse(
    String(password),
    user?.password,
  );
  if (!user || !verification.ok) {
    noterEchec(ip, String(email));
    return NextResponse.json(
      { error: "Identifiants incorrects" },
      { status: 401 },
    );
  }

  effacerEchecs(ip, String(email));

  // Ancien mot de passe encore en clair : remplacé par son empreinte bcrypt dès cette connexion
  if (verification.aRehacher) {
    await updateUserPassword(
      user.id_user,
      await hacherMotDePasse(String(password)),
    ).catch((e) => console.error("Re-hachage du mot de passe impossible", e));
  }

  // Session enregistrée (liste et révocation dans Mon compte › Sécurité)
  const sid = await createSession(
    user.id_user,
    req.headers.get("user-agent"),
  ).catch(() => undefined);

  const token = jwt.sign(
    { id: user.id_user, email: user.email, role: user.role, sid },
    secretJwt(),
    { expiresIn: dureeSecondes, algorithm: "HS256" },
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
