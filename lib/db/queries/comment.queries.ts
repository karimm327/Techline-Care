import {db} from "@/lib/db";

export async function findCommentsByDemandId(id: string) {
    const result = await db.query(
        `
      SELECT 
        c.content,
        c.created_at,
        u.first_name as author_first_name,
        u.last_name as author_last_name
      FROM comments c
      JOIN users u ON u.id_user = c.id_author
      WHERE c.id_demand = $1
      ORDER BY c.created_at ASC
    `,
        [id]
    );

    return result.rows;
}

export async function createComment(
    demandId: string,
    userId: string,
    content: string
) {
    await db.query(
        `
      INSERT INTO comments
      (id_demand, id_author, content)
      VALUES ($1,$2,$3)
    `,
        [demandId, userId, content]
    );
}