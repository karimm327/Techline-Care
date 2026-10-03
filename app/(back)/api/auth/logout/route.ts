import { type NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { revokeSession } from "@/lib/db/queries/session.queries";

// Déconnexion : supprime le cookie de session (httpOnly, donc impossible à effacer en JavaScript)
export async function POST(req: NextRequest) {
  // La session est aussi close côté serveur (jeton inutilisable même s'il a été copié)
  const user = getUserFromRequest(req);
  if (user?.sid) await revokeSession(user.id, user.sid).catch(() => {});

  const response = NextResponse.json({ success: true });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
