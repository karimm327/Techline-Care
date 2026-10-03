import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { db } from "@/lib/db";
import { reference } from "@/lib/ui/format";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Accents retirés côté SQL sans extension (unaccent n'est pas toujours installée)
const AVEC = "àâäáãéèêëíìîïóòôöõúùûüçñœæ";
const SANS = "aaaaaeeeeiiiiooooouuuucnoa";

const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Demandes ouvertes au titre proche (F10) : au moins un mot de 4 lettres ou plus en commun,
// les plus de mots communs d'abord, 3 résultats
export async function GET(req: NextRequest) {
  const garde = exigerConnexion(req);
  if ("refus" in garde) return garde.refus;

  const q = (req.nextUrl.searchParams.get("q") ?? "").slice(0, 200);
  const exclure = req.nextUrl.searchParams.get("exclude");
  const mots = [
    ...new Set(
      normaliser(q)
        .split(/[^\p{L}\p{N}]+/u)
        .filter((m) => m.length >= 4),
    ),
  ].slice(0, 8);
  if (mots.length === 0) return NextResponse.json([]);

  try {
    const r = await db.query(
      `SELECT d.id_demand AS id, d.title, s.label AS status, score
       FROM demands d
       JOIN statuses s ON s.id_status = d.id_status
       CROSS JOIN LATERAL (
         SELECT COUNT(*)::int AS score
         FROM unnest($1::text[]) AS mot
         WHERE translate(lower(d.title), $2, $3) LIKE '%' || mot || '%'
       ) x
       WHERE d.deleted_at IS NULL
         AND s.label IN ('NOUVELLE', 'EN_COURS')
         AND x.score > 0
         AND ($4::uuid IS NULL OR d.id_demand <> $4::uuid)
       ORDER BY score DESC, d.created_at DESC
       LIMIT 3`,
      [mots, AVEC, SANS, exclure && UUID.test(exclure) ? exclure : null],
    );
    return NextResponse.json(
      r.rows.map((d: { id: string; title: string; status: string }) => ({
        id: d.id,
        title: d.title,
        status: d.status,
        ref: reference(d.id),
      })),
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
