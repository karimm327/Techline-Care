import {db} from "@/lib/db";

export async function findAllAgents() {
    const result = await db.query(`
        SELECT u.id_user, u.first_name, u.last_name
        FROM users u
                 JOIN roles r ON u.id_role = r.id_role
        WHERE r.label = 'AGENT'
        ORDER BY u.last_name
    `);

    return result.rows;
}


export async function findAgentById(idAgent:number) {
    const result = await db.query(`
        SELECT 1
        FROM users u
                 JOIN roles r ON u.id_role = r.id_role
        WHERE u.id_user = $1 AND r.label = 'AGENT'
    `, [idAgent]);

    return result.rows;
}