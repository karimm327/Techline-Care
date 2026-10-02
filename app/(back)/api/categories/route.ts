import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { findAllCategories } from "@/lib/db/queries/category.queries";

export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;
  try {
    const result = await findAllCategories();

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { message: "Erreur serveur (categories)" },
      { status: 500 },
    );
  }
}
