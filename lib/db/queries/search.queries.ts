import { db } from "@/lib/db";

// Recherche rapide (palette Ctrl K) : titre ou référence pour les demandes, nom / e-mail pour les personnes
export async function rechercherDemandes(q: string, limite = 10) {
  const terme = q.trim().replace(/^#/, "");
  const r = await db.query(
    `SELECT d.id_demand AS id, d.title, s.label AS status
     FROM demands d JOIN statuses s ON s.id_status = d.id_status
     WHERE d.deleted_at IS NULL
       AND (d.title ILIKE '%' || $1 || '%' OR d.id_demand::text ILIKE $1 || '%')
     ORDER BY (d.id_demand::text ILIKE $1 || '%') DESC, d.updated_at DESC
     LIMIT $2`,
    [terme, limite],
  );
  return r.rows as { id: string; title: string; status: string }[];
}

export async function rechercherPersonnes(q: string, limite = 5) {
  const r = await db.query(
    `SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom, r.label AS role
     FROM users u JOIN roles r ON r.id_role = u.id_role
     WHERE u.is_active = true
       AND (u.first_name || ' ' || u.last_name ILIKE '%' || $1 || '%' OR u.email ILIKE '%' || $1 || '%')
     ORDER BY u.last_name, u.first_name
     LIMIT $2`,
    [q.trim(), limite],
  );
  return r.rows as { id: string; nom: string; role: string }[];
}
