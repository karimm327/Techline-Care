import { db } from "@/lib/db";

export async function findAllStatuses() {
  const result = await db.query(`
        SELECT id_status, label
        FROM statuses
        ORDER BY id_status;
    `);

  return result.rows;
}

export async function findStatusById(idStatus: number) {
  const result = await db.query(`SELECT 1 FROM statuses WHERE id_status = $1`, [
    idStatus,
  ]);

  return result.rows;
}
