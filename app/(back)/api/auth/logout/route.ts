import { NextResponse } from "next/server";

// Déconnexion : supprime le cookie de session (httpOnly, donc impossible à effacer en JavaScript)
export async function POST() {
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
