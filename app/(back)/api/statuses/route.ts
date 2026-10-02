import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findAllStatuses } from "@/lib/db/queries/status.queries";

export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const result = await findAllStatuses();

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Erreur serveur (priorities)" },
      { status: 500 },
    );
  }
}
