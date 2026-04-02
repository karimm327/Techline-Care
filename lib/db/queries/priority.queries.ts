import {db} from "@/lib/db";

export async function findAllPriorities() {
    const result = await db.query(`
        SELECT id_priority, label
        FROM priorities
        WHERE is_active = true
        ORDER BY id_priority
    `);

    return result.rows;
}

export async function findPriorityById(idPriority:number) {
    const result = await db.query(
        `SELECT 1 FROM priorities WHERE id_priority = $1 AND is_active = true`,
        [idPriority]
    );

    return result.rows;
}

