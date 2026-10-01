import {db} from "@/lib/db";

export async function findAllAgents() {
    const result = await db.query(`
        SELECT u.id_user, u.first_name, u.last_name
        FROM techlinecare.users u
                 JOIN techlinecare.roles r ON u.id_role = r.id_role
        WHERE UPPER(r.label) = 'AGENT'
        ORDER BY u.last_name
    `);

    return result.rows;
}


export async function findAgentById(idAgent: string) {
    const result = await db.query(`
        SELECT 1
        FROM techlinecare.users u
                 JOIN techlinecare.roles r
                      ON u.id_role = r.id_role
        WHERE u.id_user = $1
          AND UPPER(r.label) = 'AGENT'
    `, [idAgent]);

    return result.rows;
}

export async function findUserById(idUser: string) {
    const result = await db.query(`
        SELECT u.id_user, u.first_name, u.last_name, u.email, u.is_active, u.created_at, r.label AS role
        FROM users u
                 JOIN roles r ON u.id_role = r.id_role
        WHERE u.id_user = $1
    `, [idUser]);

    return result.rows[0] ?? null;
}

export async function countAssignedDemandsByStatus(idUser: string) {
    const result = await db.query(`
        SELECT s.label AS status, COUNT(*)::int AS total
        FROM demands d
                 JOIN statuses s ON s.id_status = d.id_status
        WHERE d.id_assigned_agent = $1 AND d.deleted_at IS NULL
        GROUP BY s.label
    `, [idUser]);

    return result.rows as { status: string; total: number }[];
}

export async function findAssignedDemands(idUser: string, limit = 8) {
    const result = await db.query(`
        SELECT d.id_demand, d.title, d.created_at, d.updated_at,
               s.label AS status, p.label AS priority, c.label AS category
        FROM demands d
                 JOIN statuses s ON s.id_status = d.id_status
                 JOIN priorities p ON p.id_priority = d.id_priority
                 JOIN categories c ON c.id_category = d.id_category
        WHERE d.id_assigned_agent = $1 AND d.deleted_at IS NULL
        ORDER BY d.updated_at DESC
        LIMIT $2
    `, [idUser, limit]);

    return result.rows;
}

export async function countCommentsByUser(idUser: string) {
    const result = await db.query(`SELECT COUNT(*)::int AS total FROM comments WHERE id_author = $1`, [idUser]);
    return result.rows[0]?.total ?? 0;
}

export async function findUserPassword(idUser: string) {
    const result = await db.query(`SELECT password FROM users WHERE id_user = $1`, [idUser]);
    return result.rows[0]?.password ?? null;
}

export async function updateUserPassword(idUser: string, password: string) {
    await db.query(`UPDATE users SET password = $1 WHERE id_user = $2`, [password, idUser]);
}
