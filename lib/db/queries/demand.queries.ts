import { db } from "@/lib/db";

export async function findAllDemands() {
    const result = await db.query(`
        SELECT
            d.id_demand,
            d.title,
            d.created_at,
            s.label AS status,
            p.label AS priority,
            c.label AS category,
            CASE
                WHEN u.id_user IS NOT NULL THEN u.first_name || ' ' || u.last_name
                ELSE NULL
                END AS agent_full_name
        FROM demands d
                 JOIN statuses s ON d.id_status = s.id_status
                 JOIN priorities p ON d.id_priority = p.id_priority
                 JOIN categories c ON d.id_category = c.id_category
                 LEFT JOIN users u ON d.id_assigned_agent = u.id_user
        ORDER BY d.created_at DESC;
    `);

    return result.rows;
}

export async function findDemandById(id: string) {
    const result = await db.query(
        `
            SELECT
                id_demand,
                title,
                description,
                id_category,
                id_priority,
                id_status,
                id_assigned_agent
            FROM demands
            WHERE id_demand = $1
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function findDemandDetailById(id: string) {
    const result = await db.query(
        `
            SELECT
                d.id_demand,
                d.title,
                d.description,
                d.created_at,
                d.updated_at,

                s.label AS status,
                p.label AS priority,
                c.label AS category,

                u.first_name || ' ' || u.last_name AS agent_full_name

            FROM demands d
                     LEFT JOIN statuses s ON d.id_status = s.id_status
                     LEFT JOIN priorities p ON d.id_priority = p.id_priority
                     LEFT JOIN categories c ON d.id_category = c.id_category
                     LEFT JOIN users u ON d.id_assigned_agent = u.id_user

            WHERE d.id_demand = $1;
        `,
        [id]
    );

    return result.rows[0] ?? null;
}

export async function createDemand(title: any, description: any, idCategory: any, idPriority: any, idAssignedAgent: any) {
    return await db.query(`
            INSERT INTO demands (
                title,
                description,
                id_category,
                id_priority,
                id_assigned_agent,
                id_status,
                created_at
            )
            VALUES (
                       $1,
                       $2,
                       $3,
                       $4,
                       $5,
                       (SELECT id_status FROM statuses WHERE label = 'NOUVELLE'),
                       NOW()
                   )
            RETURNING id_demand
        `, [
        title,
        description,
        idCategory,
        idPriority,
        idAssignedAgent || null
    ]);
}

export async function updateDemand(title: any, description: any, idCategory: any, idPriority: any, idStatus: any, idAssignedAgent: any, id: string) {
    return await db.query(
        `
                UPDATE demands
                SET title = $1,
                    description = $2,
                    id_category = $3,
                    id_priority = $4,
                    id_status = $5,
                    id_assigned_agent = $6,
                    updated_at = NOW()
                WHERE id_demand = $7
            `,
        [
            title,
            description,
            idCategory,
            idPriority,
            idStatus,
            idAssignedAgent || null,
            id
        ]
    );
}