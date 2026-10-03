import { db } from "@/lib/db";

export type Commentaire = {
  id_comment: string;
  id_author: string;
  content: string;
  created_at: string;
  is_internal: boolean;
  author_first_name?: string;
  author_last_name?: string;
  // Réactions « +1 » : total et réaction de l'utilisateur courant
  plus1: number;
  moi_plus1: boolean;
};

// Commentaires d'une demande. Les notes internes ne sont renvoyées qu'aux ADMIN / AGENT.
export async function findCommentsByDemandId(
  id: string,
  opts: { inclureInternes?: boolean; idUtilisateur?: string | null } = {},
) {
  const result = await db.query(
    `
      SELECT
        c.id_comment,
        c.id_author,
        c.content,
        c.created_at,
        c.is_internal,
        u.first_name as author_first_name,
        u.last_name as author_last_name,
        (SELECT COUNT(*)::int FROM comment_reactions r
          WHERE r.id_comment = c.id_comment AND r.emoji_code = 'plus1') AS plus1,
        EXISTS (SELECT 1 FROM comment_reactions r
          WHERE r.id_comment = c.id_comment AND r.emoji_code = 'plus1'
            AND r.id_user = $3::uuid) AS moi_plus1
      FROM comments c
      JOIN users u ON u.id_user = c.id_author
      WHERE c.id_demand = $1
        AND ($2::boolean OR NOT c.is_internal)
      ORDER BY c.created_at ASC
    `,
    [id, opts.inclureInternes ?? false, opts.idUtilisateur ?? null],
  );

  return result.rows as Commentaire[];
}

export async function createComment(
  demandId: string,
  userId: string,
  content: string,
  estInterne = false,
) {
  const r = await db.query(
    `
      INSERT INTO comments
      (id_demand, id_author, content, is_internal)
      VALUES ($1,$2,$3,$4)
      RETURNING id_comment
    `,
    [demandId, userId, content, estInterne],
  );
  return r.rows[0].id_comment as string;
}

export async function findCommentById(id: string) {
  const r = await db.query(
    `SELECT c.id_comment, c.id_demand, c.is_internal, d.deleted_at
     FROM comments c JOIN demands d ON d.id_demand = c.id_demand
     WHERE c.id_comment = $1`,
    [id],
  );
  return (
    (r.rows[0] as
      | {
          id_comment: string;
          id_demand: string;
          is_internal: boolean;
          deleted_at: string | null;
        }
      | undefined) ?? null
  );
}

// Bascule la réaction « +1 » ; renvoie le nouvel état et le total
export async function basculerPlus1(idComment: string, idUser: string) {
  const supprime = await db.query(
    `DELETE FROM comment_reactions
     WHERE id_comment = $1 AND id_user = $2 AND emoji_code = 'plus1'`,
    [idComment, idUser],
  );
  if ((supprime.rowCount ?? 0) === 0) {
    await db.query(
      `INSERT INTO comment_reactions (id_comment, id_user, emoji_code)
       VALUES ($1, $2, 'plus1') ON CONFLICT DO NOTHING`,
      [idComment, idUser],
    );
  }
  const total = await db.query(
    `SELECT COUNT(*)::int AS n FROM comment_reactions
     WHERE id_comment = $1 AND emoji_code = 'plus1'`,
    [idComment],
  );
  return {
    actif: (supprime.rowCount ?? 0) === 0,
    total: total.rows[0].n as number,
  };
}

export async function enregistrerMentions(
  idComment: string,
  idsUtilisateurs: string[],
) {
  if (idsUtilisateurs.length === 0) return;
  await db.query(
    `INSERT INTO comment_mentions (id_comment, id_user)
     SELECT $1, unnest($2::uuid[]) ON CONFLICT DO NOTHING`,
    [idComment, idsUtilisateurs],
  );
}

// Personnes mentionnables (@) : administrateurs et agents actifs
export async function findMentionnables() {
  const r = await db.query(`
    SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom
    FROM users u JOIN roles r ON r.id_role = u.id_role
    WHERE u.is_active = true
      AND UPPER(r.label) IN ('ADMIN', 'ADMINISTRATEUR', 'ADMINISTRATOR', 'AGENT')
    ORDER BY u.first_name, u.last_name
  `);
  return r.rows as { id: string; nom: string }[];
}

export async function findQuickReplies() {
  const r = await db.query(
    `SELECT id_quick_reply AS id, label, content
     FROM quick_replies WHERE is_active = true ORDER BY label`,
  );
  return r.rows as { id: string; label: string; content: string }[];
}
