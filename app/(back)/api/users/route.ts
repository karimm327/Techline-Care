import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findAllAgents } from "@/lib/db/queries/user.queries";

export async function GET(request: NextRequest) {
  const garde = exigerConnexion(request);
  if ("refus" in garde) return garde.refus;

  const { searchParams } = new URL(request.url);

  const role = searchParams.get("role");

  try {
    const result = role?.toLowerCase() === "agent" ? await findAllAgents() : [];

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
