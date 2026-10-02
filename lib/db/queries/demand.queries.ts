import { db } from "@/lib/db";

export async function findAllDemands(
  sortBy: string = "created_at",
  sortOrder: string = "DESC",
) {
  const allowedSortFields: Record<string, string> = {
    created_at: "d.created_at",
    title: "d.title",
    priority: "p.level",
    status: "s.label",
  };

  const allowedOrders = ["ASC", "DESC"];

  const orderColumn = allowedSortFields[sortBy] ?? "d.created_at";
  const orderDirection = allowedOrders.includes(sortOrder.toUpperCase())
    ? sortOrder.toUpperCase()
    : "DESC";

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
    JOIN statuses   s ON d.id_status        = s.id_status
    JOIN priorities p ON d.id_priority      = p.id_priority
    JOIN categories c ON d.id_category      = c.id_category
    LEFT JOIN users u ON d.id_assigned_agent = u.id_user
    WHERE d.deleted_at IS NULL
    ORDER BY ${orderColumn} ${orderDirection}
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
        id_assigned_agent,
        deleted_at
      FROM demands
      WHERE id_demand = $1
    `,
    [id],
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
        u.first_name || ' ' || u.last_name AS agent_full_name,
        d.deleted_at,
        d.delete_reason,
        del.first_name || ' ' || del.last_name AS deleted_by_name
      FROM demands d
      LEFT JOIN statuses   s ON d.id_status        = s.id_status
      LEFT JOIN priorities p ON d.id_priority      = p.id_priority
      LEFT JOIN categories c ON d.id_category      = c.id_category
      LEFT JOIN users      u ON d.id_assigned_agent = u.id_user
      LEFT JOIN users    del ON d.deleted_by        = del.id_user
      WHERE d.id_demand = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createDemand(
  title: string,
  description: string,
  idCategory: string,
  idPriority: string,
  idAssignedAgent: string | null | undefined,
) {
  return await db.query(
    `
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
    `,
    [title, description, idCategory, idPriority, idAssignedAgent || null],
  );
}

export async function updateDemand(
  title: string,
  description: string,
  idCategory: string,
  idPriority: string,
  idStatus: string,
  idAssignedAgent: string | null | undefined,
  id: string,
) {
  return await db.query(
    `
      UPDATE demands
      SET title             = $1,
          description       = $2,
          id_category       = $3,
          id_priority       = $4,
          id_status         = $5,
          id_assigned_agent = $6,
          updated_at        = NOW()
      WHERE id_demand = $7
    `,
    [
      title,
      description,
      idCategory,
      idPriority,
      idStatus,
      idAssignedAgent || null,
      id,
    ],
  );
}

/* Suppression douce : la demande est marquée, jamais effacée */
export async function softDeleteDemand(
  id: string,
  idUser: string,
  raison: string,
) {
  return await db.query(
    `
      UPDATE demands
      SET deleted_at = NOW(), deleted_by = $2, delete_reason = $3
      WHERE id_demand = $1 AND deleted_at IS NULL
    `,
    [id, idUser, raison],
  );
}

export async function restoreDemand(id: string) {
  return await db.query(
    `
      UPDATE demands
      SET deleted_at = NULL, deleted_by = NULL, delete_reason = NULL, updated_at = NOW()
      WHERE id_demand = $1 AND deleted_at IS NOT NULL
    `,
    [id],
  );
}

/* Libellés lisibles pour le résumé des modifications du journal */
export async function findLabelsForDemandIds(ids: {
  category?: string | null;
  priority?: string | null;
  status?: string | null;
  agent?: string | null;
}) {
  const r = await db.query(
    `
      SELECT
        (SELECT label FROM categories WHERE id_category = $1::uuid) AS category,
        (SELECT label FROM priorities WHERE id_priority = $2::uuid) AS priority,
        (SELECT label FROM statuses   WHERE id_status   = $3::uuid) AS status,
        (SELECT first_name || ' ' || last_name FROM users WHERE id_user = $4::uuid) AS agent
    `,
    [
      ids.category || null,
      ids.priority || null,
      ids.status || null,
      ids.agent || null,
    ],
  );
  return r.rows[0] as {
    category: string | null;
    priority: string | null;
    status: string | null;
    agent: string | null;
  };
}
