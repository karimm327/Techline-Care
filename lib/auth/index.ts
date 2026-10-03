import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { estRevoquee } from "@/lib/auth/revocations";
import type { Role } from "@/lib/types/Role";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  // Identifiant de session (connexions depuis la refonte) : révocable depuis Mon compte
  sid?: string;
};

// Vérifie un token JWT et renvoie l'utilisateur, ou null s'il est absent / invalide / expiré
// Secret de signature des sessions : obligatoire et suffisamment long (32 caractères minimum)
export function secretJwt(): string {
  const secret = process.env.JWT_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error("JWT_SECRET manquant ou trop court (32 caractères minimum)");
  }
  return secret;
}

export function verifierToken(
  token: string | undefined | null,
): AuthUser | null {
  if (!token) return null;
  try {
    // Algorithme imposé : refuse tout jeton signé autrement (ou non signé)
    const user = jwt.verify(token, secretJwt(), {
      algorithms: ["HS256"],
    }) as AuthUser;
    // Session révoquée depuis « Sessions actives » : jeton refusé
    if (estRevoquee(user.sid)) return null;
    // Rôle en MAJUSCULES : "admin", "Admin" ou "ADMIN" sont traités pareil
    return {
      ...user,
      role: String(user.role ?? "")
        .trim()
        .toUpperCase() as Role,
    };
  } catch {
    return null;
  }
}

// Rôles qui peuvent seulement consulter (ni créer, ni modifier, ni commenter)
const ROLES_LECTURE_SEULE = [
  "LECTURE",
  "LECTEUR",
  "LECTURE_SEULE",
  "CONSULTATION",
  "VIEWER",
  "READONLY",
];

export function estLectureSeule(role: string | undefined | null): boolean {
  return ROLES_LECTURE_SEULE.includes(
    String(role ?? "")
      .trim()
      .toUpperCase(),
  );
}

// Utilisateur d'une requête API : cookie "token" en priorité, sinon en-tête "Authorization: Bearer ..."
export function getUserFromRequest(req: NextRequest): AuthUser | null {
  // 1. Le cookie de session du navigateur (le plus fiable : mis à jour à chaque connexion)
  const depuisCookie = verifierToken(req.cookies.get("token")?.value);
  if (depuisCookie) return depuisCookie;
  // 2. Sinon l'en-tête "Authorization: Bearer ..." (outils comme test.http, Postman…)
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer "))
    return verifierToken(authHeader.substring(7));
  return null;
}

// À utiliser au début d'une route API : renvoie soit l'utilisateur, soit une réponse 401/403 prête
export function exigerConnexion(
  req: NextRequest,
  rolesAutorises?: Role[],
): { user: AuthUser } | { refus: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) {
    return {
      refus: NextResponse.json({ message: "Non authentifié" }, { status: 401 }),
    };
  }
  // Action d'écriture (créer, modifier, commenter) : refusée seulement aux rôles en lecture seule
  if (
    rolesAutorises &&
    !rolesAutorises.includes(user.role) &&
    estLectureSeule(user.role)
  ) {
    return {
      refus: NextResponse.json(
        {
          message: `Accès refusé : ton rôle (${user.role}) est en lecture seule.`,
        },
        { status: 403 },
      ),
    };
  }
  return { user };
}

export function requireRole(userRole: Role, allowed: Role[]) {
  if (!allowed.includes(userRole)) {
    throw new Error("FORBIDDEN");
  }
}

// Administrateur : seul à voir le journal d'activité et à restaurer une demande supprimée
export function estAdmin(role: string | undefined | null): boolean {
  return ["ADMIN", "ADMINISTRATEUR", "ADMINISTRATOR"].includes(
    String(role ?? "")
      .trim()
      .toUpperCase(),
  );
}

// Rôle canonique quel que soit le libellé en base (« administrateur », « ADMIN », « lecture »…)
export function roleCanonique(
  role: string | undefined | null,
): "ADMIN" | "AGENT" | "LECTURE" {
  if (estAdmin(role)) return "ADMIN";
  if (estLectureSeule(role)) return "LECTURE";
  return "AGENT";
}
