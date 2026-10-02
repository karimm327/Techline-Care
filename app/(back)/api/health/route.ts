import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Au-delà de ce délai la base répond, mais lentement
const SEUIL_RALENTI_MS = 800;
const DELAI_MAX_MS = 2000;

// Santé du service (F16), route publique utilisée par la pastille du footer
export async function GET() {
  const debut = performance.now();
  let minuteur: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      db.query("SELECT 1"),
      new Promise((_, refuser) => {
        minuteur = setTimeout(
          () => refuser(new Error("Délai dépassé")),
          DELAI_MAX_MS,
        );
      }),
    ]);
    const latenceMs = Math.round(performance.now() - debut);
    return NextResponse.json(
      { status: latenceMs > SEUIL_RALENTI_MS ? "degrade" : "ok", latenceMs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { status: "ko", latenceMs: Math.round(performance.now() - debut) },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  } finally {
    clearTimeout(minuteur);
  }
}
