import { marquerRevoquees } from "@/lib/auth/revocations";
import { db } from "@/lib/db";

export type SessionUtilisateur = {
  id: string;
  user_agent: string | null;
  created_at: string;
  last_seen_at: string;
};

// Nouvelle session à la connexion ; son identifiant (sid) est placé dans le jeton
export async function createSession(idUser: string, userAgent: string | null) {
  const r = await db.query(
    `INSERT INTO user_sessions (id_user, user_agent)
     VALUES ($1, $2) RETURNING id_session`,
    [idUser, userAgent?.slice(0, 300) ?? null],
  );
  return r.rows[0].id_session as string;
}

// Sessions actives (non révoquées, vues ces 30 derniers jours)
export async function findSessions(idUser: string) {
  const r = await db.query(
    `SELECT id_session AS id, user_agent, created_at, last_seen_at
     FROM user_sessions
     WHERE id_user = $1 AND revoked_at IS NULL
       AND last_seen_at > now() - interval '30 days'
     ORDER BY last_seen_at DESC`,
    [idUser],
  );
  return r.rows as SessionUtilisateur[];
}

// Révocation par son propriétaire ; le jeton correspondant est refusé immédiatement
export async function revokeSession(idUser: string, id: string) {
  const r = await db.query(
    `UPDATE user_sessions SET revoked_at = now()
     WHERE id_session = $1 AND id_user = $2 AND revoked_at IS NULL`,
    [id, idUser],
  );
  if ((r.rowCount ?? 0) > 0) marquerRevoquees([id]);
  return (r.rowCount ?? 0) > 0;
}

// Dernière activité, au plus une écriture toutes les 5 minutes par session
const derniersPassages = new Map<string, number>();
export async function toucherSession(id: string) {
  const maintenant = Date.now();
  if (maintenant - (derniersPassages.get(id) ?? 0) < 5 * 60_000) return;
  derniersPassages.set(id, maintenant);
  await db
    .query(
      "UPDATE user_sessions SET last_seen_at = now() WHERE id_session = $1",
      [id],
    )
    .catch(() => {});
}
