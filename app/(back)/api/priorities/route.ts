import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findAllPriorities } from "@/lib/db/queries/priority.queries";

export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const result = await findAllPriorities();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Erreur serveur (priorities)" },
      { status: 500 },
    );
  }
}
