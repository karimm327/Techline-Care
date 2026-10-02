import { db } from "@/lib/db";
import { findUserById } from "@/lib/db/queries/user.queries";

export const ACTIONS = [
  "CREATION",
  "MODIFICATION",
  "SUPPRESSION",
  "RESTAURATION",
  "COMMENTAIRE",
] as const;
export type Action = (typeof ACTIONS)[number];

export async function logActivity(params: {
  action: Action;
  idUser: string;
  idDemand?: string | null;
  details?: string | null;
}) {
  try {
    const u = await findUserById(params.idUser);
    const nom = u ? `${u.first_name} ${u.last_name}` : "Utilisateur inconnu";
    await db.query(
      `INSERT INTO activity_logs (action, actor_label, id_user, id_demand, details)
             VALUES ($1, $2, $3, $4, $5)`,
      [
        params.action,
        nom.slice(0, 100),
        params.idUser,
        params.idDemand ?? null,
        params.details ?? null,
      ],
    );
  } catch (e) {
    console.error("Journal d'activité : écriture impossible", e);
  }
}

export type LigneJournal = {
  id_activity_log: string;
  action: string;
  created_at: string;
  actor_label: string;
  id_user: string | null;
  id_demand: string | null;
  details: string | null;
  demand_title: string | null;
  demand_deleted: boolean;
};

const SELECT_JOURNAL = `
    SELECT a.id_activity_log, a.action, a.created_at, a.actor_label, a.id_user, a.id_demand, a.details,
           d.title AS demand_title,
           (d.deleted_at IS NOT NULL) AS demand_deleted
    FROM activity_logs a
    LEFT JOIN demands d ON d.id_demand = a.id_demand
`;

export async function findActivity(opts: {
  action?: string;
  page?: number;
  parPage?: number;
}) {
  const parPage = opts.parPage ?? 20;
  const page = Math.max(1, opts.page ?? 1);
  const filtre =
    opts.action && (ACTIONS as readonly string[]).includes(opts.action)
      ? opts.action
      : null;

  const [lignes, total] = await Promise.all([
    db.query(
      `${SELECT_JOURNAL}
             WHERE ($1::text IS NULL OR a.action = $1)
             ORDER BY a.created_at DESC
             LIMIT $2 OFFSET $3`,
      [filtre, parPage, (page - 1) * parPage],
    ),
    db.query(
      `SELECT COUNT(*)::int AS total FROM activity_logs WHERE ($1::text IS NULL OR action = $1)`,
      [filtre],
    ),
  ]);

  return {
    lignes: lignes.rows as LigneJournal[],
    total: total.rows[0].total as number,
    page,
    parPage,
  };
}

export async function countActivityByAction() {
  const r = await db.query(
    `SELECT action, COUNT(*)::int AS total FROM activity_logs GROUP BY action`,
  );
  return Object.fromEntries(
    r.rows.map((x: { action: string; total: number }) => [x.action, x.total]),
  ) as Record<string, number>;
}

export async function findRecentActivity(limit = 6) {
  const r = await db.query(
    `${SELECT_JOURNAL} ORDER BY a.created_at DESC LIMIT $1`,
    [limit],
  );
  return r.rows as LigneJournal[];
}

export async function findActivityByDemand(idDemand: string) {
  const r = await db.query(
    `${SELECT_JOURNAL} WHERE a.id_demand = $1 ORDER BY a.created_at DESC`,
    [idDemand],
  );
  return r.rows as LigneJournal[];
}

export async function countDeletedDemands() {
  const r = await db.query(
    `SELECT COUNT(*)::int AS total FROM demands WHERE deleted_at IS NOT NULL`,
  );
  return r.rows[0].total as number;
}

/* ---------- Journal filtrable (page /journal) ---------- */

export type FiltresJournal = {
  action?: string;
  // Recherche dans l'acteur ou le titre de la demande
  q?: string;
  // Dates incluses, format AAAA-MM-JJ
  du?: string;
  au?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function conditionsJournal(f: FiltresJournal, avecAction: boolean) {
  const conditions: string[] = [];
  const valeurs: unknown[] = [];
  const ajouter = (sql: (n: number) => string, v: unknown) => {
    valeurs.push(v);
    conditions.push(sql(valeurs.length));
  };
  if (
    avecAction &&
    f.action &&
    (ACTIONS as readonly string[]).includes(f.action)
  )
    ajouter((n) => `a.action = $${n}`, f.action);
  if (f.q?.trim())
    ajouter(
      (n) =>
        `(a.actor_label ILIKE '%' || $${n} || '%' OR d.title ILIKE '%' || $${n} || '%')`,
      f.q.trim(),
    );
  if (f.du && DATE.test(f.du))
    ajouter((n) => `a.created_at >= $${n}::date`, f.du);
  if (f.au && DATE.test(f.au))
    ajouter((n) => `a.created_at < $${n}::date + interval '1 day'`, f.au);
  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    valeurs,
  };
}

// Événements les plus récents d'abord, `limite` premiers (« Charger plus » augmente la limite)
export async function findJournal(f: FiltresJournal, limite: number) {
  const { where, valeurs } = conditionsJournal(f, true);
  const [lignes, total] = await Promise.all([
    db.query(
      `${SELECT_JOURNAL} ${where} ORDER BY a.created_at DESC LIMIT $${valeurs.length + 1}`,
      [...valeurs, limite],
    ),
    db.query(
      `SELECT COUNT(*)::int AS total FROM activity_logs a
       LEFT JOIN demands d ON d.id_demand = a.id_demand ${where}`,
      valeurs,
    ),
  ]);
  return {
    lignes: lignes.rows as LigneJournal[],
    total: total.rows[0].total as number,
  };
}

// Compteurs par action, avec les mêmes filtres de recherche et de période (sans le filtre d'action)
export async function countJournalParAction(f: FiltresJournal) {
  const { where, valeurs } = conditionsJournal(f, false);
  const r = await db.query(
    `SELECT a.action, COUNT(*)::int AS total FROM activity_logs a
     LEFT JOIN demands d ON d.id_demand = a.id_demand ${where}
     GROUP BY a.action`,
    valeurs,
  );
  return Object.fromEntries(
    r.rows.map((x: { action: string; total: number }) => [x.action, x.total]),
  ) as Record<string, number>;
}
