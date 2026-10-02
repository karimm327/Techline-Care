import { db } from "@/lib/db";

export async function findUserByEmail(email: string) {
  const result = await db.query(
    `SELECT u.id_user, u.first_name, u.last_name, u.email, u.password, r.label AS role
         FROM users u
         JOIN roles r ON u.id_role = r.id_role
         WHERE u.email = $1`,
    [email],
  );

  return result.rows[0] ?? null;
}
