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
        d.id_assigned_agent,
        u.first_name || ' ' || u.last_name AS agent_full_name,
        d.deleted_at,
        d.delete_reason,
        del.first_name || ' ' || del.last_name AS deleted_by_name,
        d.due_at,
        d.closed_at,
        d.first_response_at,
        p.resolution_minutes,
        d.created_by,
        cre.first_name || ' ' || cre.last_name AS created_by_name
      FROM demands d
      LEFT JOIN statuses   s ON d.id_status        = s.id_status
      LEFT JOIN priorities p ON d.id_priority      = p.id_priority
      LEFT JOIN categories c ON d.id_category      = c.id_category
      LEFT JOIN users      u ON d.id_assigned_agent = u.id_user
      LEFT JOIN users    del ON d.deleted_by        = del.id_user
      LEFT JOIN users    cre ON d.created_by        = cre.id_user
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
  idCreateur: string | null = null,
) {
  // L'échéance (due_at) est calculée par le trigger tl_demande_sla
  return await db.query(
    `
      INSERT INTO demands (
        title,
        description,
        id_category,
        id_priority,
        id_assigned_agent,
        id_status,
        created_at,
        created_by
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        (SELECT id_status FROM statuses WHERE label = 'NOUVELLE'),
        NOW(),
        $6
      )
      RETURNING id_demand
    `,
    [
      title,
      description,
      idCategory,
      idPriority,
      idAssignedAgent || null,
      idCreateur,
    ],
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

/* ---------- Tableau de bord ---------- */

export type FiltresDemandes = {
  statuts?: string[];
  priorites?: string[];
  categories?: string[];
  // Identifiants d'agents, ou « aucun » pour les demandes non assignées
  agents?: string[];
  // État SLA des demandes ouvertes : late (dépassé), warn (< 25 % restant), ok
  sla?: string[];
  q?: string;
};

const CONDITIONS_SLA: Record<string, string> = {
  late: "d.due_at < now()",
  warn: "d.due_at >= now() AND (d.due_at - now()) < (d.due_at - d.created_at) * 0.25",
  ok: "d.due_at >= now() AND (d.due_at - now()) >= (d.due_at - d.created_at) * 0.25",
};

export type LigneDemande = {
  id_demand: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: string;
  priority: string;
  category: string;
  id_assigned_agent: string | null;
  agent_full_name: string | null;
  due_at: string | null;
  closed_at: string | null;
};

const TRIS: Record<string, string> = {
  created_at: "d.created_at",
  updated_at: "d.updated_at",
  title: "d.title",
  priority: "p.level",
  status: "s.label",
  category: "c.label",
  agent: "agent_full_name",
  sla: "d.due_at",
};

// Clause WHERE commune (liste, export CSV) : paramètres positionnels à partir de $1
export function construireFiltres(f: FiltresDemandes) {
  const conditions = ["d.deleted_at IS NULL"];
  const valeurs: unknown[] = [];
  const ajouter = (sql: (n: number) => string, valeur: unknown) => {
    valeurs.push(valeur);
    conditions.push(sql(valeurs.length));
  };
  if (f.statuts?.length)
    ajouter((n) => `s.label = ANY($${n}::text[])`, f.statuts);
  if (f.priorites?.length)
    ajouter((n) => `p.label = ANY($${n}::text[])`, f.priorites);
  if (f.categories?.length)
    ajouter((n) => `c.label = ANY($${n}::text[])`, f.categories);
  if (f.agents?.length) {
    const ids = f.agents.filter((a) => a !== "aucun");
    const sansAgent = f.agents.includes("aucun");
    valeurs.push(ids);
    const n = valeurs.length;
    conditions.push(
      `(d.id_assigned_agent::text = ANY($${n}::text[])${sansAgent ? " OR d.id_assigned_agent IS NULL" : ""})`,
    );
  }
  const etatsSla = (f.sla ?? []).filter((e) => e in CONDITIONS_SLA);
  if (etatsSla.length) {
    conditions.push(
      `(s.label IN ('NOUVELLE', 'EN_COURS') AND (${etatsSla.map((e) => `(${CONDITIONS_SLA[e]})`).join(" OR ")}))`,
    );
  }
  if (f.q?.trim()) {
    const terme = f.q.trim();
    ajouter(
      (n) =>
        `(d.title ILIKE '%' || $${n} || '%' OR d.id_demand::text ILIKE $${n} || '%')`,
      // « #7B20E1AA » ou « 7b20 » : ILIKE ignore la casse
      terme.replace(/^#/, ""),
    );
  }
  return { where: conditions.join(" AND "), valeurs };
}

const SELECT_LISTE = `
  SELECT
    -- updated_at peut être vide sur d'anciennes lignes : repli sur la date de création
    d.id_demand, d.title, d.created_at, COALESCE(d.updated_at, d.created_at) AS updated_at,
    s.label AS status, p.label AS priority, c.label AS category,
    d.id_assigned_agent,
    CASE WHEN u.id_user IS NOT NULL THEN u.first_name || ' ' || u.last_name END AS agent_full_name,
    d.due_at, d.closed_at
  FROM demands d
  JOIN statuses   s ON d.id_status   = s.id_status
  JOIN priorities p ON d.id_priority = p.id_priority
  JOIN categories c ON d.id_category = c.id_category
  LEFT JOIN users u ON d.id_assigned_agent = u.id_user
`;

// Liste filtrée, triée et paginée en SQL
export async function findDemandsPage(opts: {
  filtres: FiltresDemandes;
  sortBy?: string;
  sortOrder?: string;
  page: number;
  parPage: number;
}) {
  const colonne = TRIS[opts.sortBy ?? ""] ?? "d.created_at";
  const sens = opts.sortOrder?.toUpperCase() === "ASC" ? "ASC" : "DESC";
  const { where, valeurs } = construireFiltres(opts.filtres);
  const n = valeurs.length;
  const r = await db.query(
    `${SELECT_LISTE}
     WHERE ${where}
     ORDER BY ${colonne} ${sens} NULLS LAST, d.created_at DESC
     LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...valeurs, opts.parPage, (opts.page - 1) * opts.parPage],
  );
  const total = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM demands d
     JOIN statuses   s ON d.id_status   = s.id_status
     JOIN priorities p ON d.id_priority = p.id_priority
     JOIN categories c ON d.id_category = c.id_category
     WHERE ${where}`,
    valeurs,
  );
  return {
    lignes: r.rows as LigneDemande[],
    total: total.rows[0].total as number,
  };
}

// Toutes les demandes correspondant aux filtres (export CSV, Kanban)
export async function findDemandsFiltrees(
  filtres: FiltresDemandes,
  limite = 1000,
) {
  const { where, valeurs } = construireFiltres(filtres);
  const r = await db.query(
    `${SELECT_LISTE} WHERE ${where} ORDER BY d.updated_at DESC LIMIT $${valeurs.length + 1}`,
    [...valeurs, limite],
  );
  return r.rows as LigneDemande[];
}

// Indicateurs du tableau de bord (toutes demandes non supprimées)
export async function findIndicateurs() {
  const r = await db.query(`
    SELECT
      COUNT(*) FILTER (WHERE s.label = 'NOUVELLE')::int AS nouvelles,
      COUNT(*) FILTER (WHERE s.label = 'EN_COURS')::int AS en_cours,
      COUNT(*) FILTER (WHERE s.label = 'NOUVELLE' AND p.label = 'HAUTE')::int AS nouvelles_hautes,
      COUNT(*) FILTER (WHERE s.label IN ('NOUVELLE','EN_COURS') AND d.id_assigned_agent IS NULL)::int AS non_assignees,
      COUNT(*) FILTER (WHERE s.label IN ('NOUVELLE','EN_COURS') AND d.id_assigned_agent IS NULL AND p.label = 'HAUTE')::int AS non_assignees_urgentes,
      COUNT(*) FILTER (WHERE d.created_at >= date_trunc('day', now()))::int AS creees_aujourdhui,
      COUNT(*) FILTER (WHERE d.closed_at >= now() - interval '7 days')::int AS cloturees_7j,
      -- 1re réponse moyenne (heures) des demandes créées ces 30 derniers jours
      ROUND((AVG(EXTRACT(EPOCH FROM (d.first_response_at - d.created_at)) / 3600)
        FILTER (WHERE d.first_response_at IS NOT NULL AND d.created_at >= now() - interval '30 days'))::numeric, 1)::float AS premiere_reponse_h,
      AVG(p.first_response_minutes) FILTER (WHERE s.label IN ('NOUVELLE','EN_COURS'))::float / 60 AS objectif_reponse_h,
      COUNT(*) FILTER (WHERE s.label IN ('NOUVELLE','EN_COURS') AND d.due_at < now())::int AS sla_depasses
    FROM demands d
    JOIN statuses s ON s.id_status = d.id_status
    JOIN priorities p ON p.id_priority = d.id_priority
    WHERE d.deleted_at IS NULL
  `);
  return r.rows[0] as {
    nouvelles: number;
    en_cours: number;
    nouvelles_hautes: number;
    non_assignees: number;
    non_assignees_urgentes: number;
    creees_aujourdhui: number;
    cloturees_7j: number;
    premiere_reponse_h: number | null;
    objectif_reponse_h: number | null;
    sla_depasses: number;
  };
}

// Séries des N derniers jours : créées, créées sans agent, clôturées, 1re réponse moyenne (h)
export async function findDailyCounts(jours = 14) {
  const r = await db.query(
    `
    WITH jours AS (
      SELECT generate_series(date_trunc('day', now()) - ($1::int - 1) * interval '1 day',
                             date_trunc('day', now()), interval '1 day') AS jour
    )
    SELECT
      j.jour,
      (SELECT COUNT(*) FROM demands d
         WHERE d.deleted_at IS NULL AND date_trunc('day', d.created_at) = j.jour)::int AS creees,
      (SELECT COUNT(*) FROM demands d
         WHERE d.deleted_at IS NULL AND d.id_assigned_agent IS NULL
           AND date_trunc('day', d.created_at) = j.jour)::int AS sans_agent,
      (SELECT COUNT(*) FROM demands d
         WHERE d.deleted_at IS NULL AND date_trunc('day', d.closed_at) = j.jour)::int AS cloturees,
      (SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (d.first_response_at - d.created_at)) / 3600), 0)
         FROM demands d
         WHERE d.deleted_at IS NULL AND d.first_response_at IS NOT NULL
           AND date_trunc('day', d.created_at) = j.jour)::float AS reponse_h
    FROM jours j
    ORDER BY j.jour
    `,
    [jours],
  );
  return r.rows as {
    jour: string;
    creees: number;
    sans_agent: number;
    cloturees: number;
    reponse_h: number;
  }[];
}

// Charge : demandes ouvertes par agent (y compris les agents sans demande)
export async function findChargeEquipe() {
  const r = await db.query(`
    SELECT u.id_user, u.first_name || ' ' || u.last_name AS nom,
           COUNT(d.id_demand)::int AS ouvertes
    FROM users u
    JOIN roles r ON r.id_role = u.id_role
    LEFT JOIN demands d ON d.id_assigned_agent = u.id_user AND d.deleted_at IS NULL
      AND d.id_status IN (SELECT id_status FROM statuses WHERE label IN ('NOUVELLE','EN_COURS'))
    WHERE UPPER(r.label) = 'AGENT' AND u.is_active = true
    GROUP BY u.id_user, u.first_name, u.last_name
    ORDER BY ouvertes DESC, nom
  `);
  return r.rows as { id_user: string; nom: string; ouvertes: number }[];
}

/* ---------- Mise à jour partielle (statut, priorité, agent) ---------- */

export async function findStatusIdByLabel(label: string) {
  const r = await db.query(`SELECT id_status FROM statuses WHERE label = $1`, [
    label,
  ]);
  return (r.rows[0]?.id_status as string | undefined) ?? null;
}

export async function findPriorityIdByLabel(label: string) {
  const r = await db.query(
    `SELECT id_priority FROM priorities WHERE label = $1 AND is_active = true`,
    [label],
  );
  return (r.rows[0]?.id_priority as string | undefined) ?? null;
}

// Ne modifie que les champs fournis ; renvoie false si la demande n'existe plus (ou est supprimée)
export async function updateDemandPartielle(
  id: string,
  champs: {
    idStatus?: string;
    idPriority?: string;
    idAssignedAgent?: string | null;
  },
) {
  const sets: string[] = [];
  const valeurs: unknown[] = [];
  if (champs.idStatus !== undefined) {
    valeurs.push(champs.idStatus);
    sets.push(`id_status = $${valeurs.length}`);
  }
  if (champs.idPriority !== undefined) {
    valeurs.push(champs.idPriority);
    sets.push(`id_priority = $${valeurs.length}`);
  }
  if (champs.idAssignedAgent !== undefined) {
    valeurs.push(champs.idAssignedAgent);
    sets.push(`id_assigned_agent = $${valeurs.length}`);
  }
  if (sets.length === 0) return true;
  valeurs.push(id);
  const r = await db.query(
    `UPDATE demands SET ${sets.join(", ")}, updated_at = NOW()
     WHERE id_demand = $${valeurs.length} AND deleted_at IS NULL`,
    valeurs,
  );
  return (r.rowCount ?? 0) > 0;
}

// Nombre de demandes ouvertes (NOUVELLE, EN_COURS) assignées à un agent
export async function countDemandesOuvertesAgent(idAgent: string) {
  const r = await db.query(
    `SELECT COUNT(*)::int AS total
     FROM demands d JOIN statuses s ON s.id_status = d.id_status
     WHERE d.id_assigned_agent = $1 AND d.deleted_at IS NULL
       AND s.label IN ('NOUVELLE', 'EN_COURS')`,
    [idAgent],
  );
  return r.rows[0].total as number;
}
