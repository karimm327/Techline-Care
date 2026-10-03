import { db } from "@/lib/db";

export type Vue = {
  id: string;
  name: string;
  color: string;
  query: string;
  position: number;
};

export const MAX_VUES = 10;
export const COULEURS_VUE = [
  "accent",
  "nouvelle",
  "encours",
  "cloturee",
  "haute",
  "annulee",
] as const;

// Vues enregistrées (F7) de l'utilisateur, dans l'ordre choisi
export async function findVues(idUser: string) {
  const r = await db.query(
    `SELECT id_view AS id, name, color, query, position
     FROM saved_views WHERE id_user = $1
     ORDER BY position, created_at`,
    [idUser],
  );
  return r.rows as Vue[];
}

export async function countVues(idUser: string) {
  const r = await db.query(
    "SELECT COUNT(*)::int AS n FROM saved_views WHERE id_user = $1",
    [idUser],
  );
  return r.rows[0].n as number;
}

export async function createVue(
  idUser: string,
  v: { name: string; color: string; query: string },
) {
  const r = await db.query(
    `INSERT INTO saved_views (id_user, name, color, query, position)
     VALUES ($1, $2, $3, $4,
       COALESCE((SELECT MAX(position) + 1 FROM saved_views WHERE id_user = $1), 0))
     RETURNING id_view AS id, name, color, query, position`,
    [idUser, v.name, v.color, v.query],
  );
  return r.rows[0] as Vue;
}

// Modification par le propriétaire uniquement ; renvoie false si la vue n'est pas à lui
export async function updateVue(
  idUser: string,
  id: string,
  v: { name?: string; color?: string; position?: number },
) {
  const r = await db.query(
    `UPDATE saved_views
     SET name = COALESCE($3, name), color = COALESCE($4, color),
         position = COALESCE($5, position)
     WHERE id_view = $1 AND id_user = $2`,
    [id, idUser, v.name ?? null, v.color ?? null, v.position ?? null],
  );
  return (r.rowCount ?? 0) > 0;
}

export async function deleteVue(idUser: string, id: string) {
  const r = await db.query(
    "DELETE FROM saved_views WHERE id_view = $1 AND id_user = $2",
    [id, idUser],
  );
  return (r.rowCount ?? 0) > 0;
}
