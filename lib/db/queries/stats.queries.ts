import { db } from "@/lib/db";

export const PERIODES = [7, 14, 30, 90] as const;
export type Periode = (typeof PERIODES)[number];

export type Statistiques = {
  kpi: {
    crees: number;
    creesAvant: number;
    delaiMoyenH: number | null;
    slaRespectes: number | null; // %
    reouverture: number | null; // %
    clotureesPeriode: number;
  };
  serie: { jour: string; crees: number; cloturees: number }[];
  categories: { label: string; n: number }[];
  // 5 jours ouvrés (lun → ven) × 9 heures (9 h → 17 h)
  heatmap: number[][];
  agents: {
    id: string;
    nom: string;
    cloturees: number;
    delaiMoyenH: number | null;
    sla: number | null;
  }[];
};

// Indicateurs de la page Statistiques (F13) sur les `jours` derniers jours
export async function findStatistiques(jours: Periode): Promise<Statistiques> {
  const [kpi, serie, categories, chaleur, agents] = await Promise.all([
    db.query(
      `SELECT
         COUNT(*) FILTER (WHERE created_at >= now() - make_interval(days => $1))::int AS crees,
         COUNT(*) FILTER (WHERE created_at >= now() - make_interval(days => $1 * 2)
                            AND created_at < now() - make_interval(days => $1))::int AS crees_avant,
         COUNT(*) FILTER (WHERE closed_at >= now() - make_interval(days => $1))::int AS cloturees,
         ROUND((AVG(EXTRACT(EPOCH FROM (closed_at - created_at)) / 3600)
           FILTER (WHERE closed_at >= now() - make_interval(days => $1)))::numeric, 1)::float AS delai_h,
         ROUND(100.0 * COUNT(*) FILTER (WHERE closed_at >= now() - make_interval(days => $1) AND closed_at <= due_at)
           / NULLIF(COUNT(*) FILTER (WHERE closed_at >= now() - make_interval(days => $1)), 0))::int AS sla,
         ROUND(100.0 * COUNT(*) FILTER (WHERE closed_at >= now() - make_interval(days => $1) AND reopened_count > 0)
           / NULLIF(COUNT(*) FILTER (WHERE closed_at >= now() - make_interval(days => $1)), 0))::int AS reouverture
       FROM demands WHERE deleted_at IS NULL`,
      [jours],
    ),
    db.query(
      `WITH jours AS (
         SELECT generate_series(date_trunc('day', now()) - ($1::int - 1) * interval '1 day',
                                date_trunc('day', now()), interval '1 day') AS jour
       )
       SELECT j.jour,
         (SELECT COUNT(*) FROM demands d WHERE d.deleted_at IS NULL
            AND date_trunc('day', d.created_at) = j.jour)::int AS crees,
         (SELECT COUNT(*) FROM demands d WHERE d.deleted_at IS NULL
            AND date_trunc('day', d.closed_at) = j.jour)::int AS cloturees
       FROM jours j ORDER BY j.jour`,
      [jours],
    ),
    db.query(
      `SELECT c.label, COUNT(d.id_demand)::int AS n
       FROM categories c
       LEFT JOIN demands d ON d.id_category = c.id_category AND d.deleted_at IS NULL
         AND d.created_at >= now() - make_interval(days => $1)
       WHERE c.is_active = true
       GROUP BY c.label ORDER BY n DESC, c.label`,
      [jours],
    ),
    db.query(
      `SELECT EXTRACT(ISODOW FROM created_at)::int AS jour, EXTRACT(HOUR FROM created_at)::int AS heure,
              COUNT(*)::int AS n
       FROM demands
       WHERE deleted_at IS NULL AND created_at >= now() - make_interval(days => $1)
         AND EXTRACT(ISODOW FROM created_at) BETWEEN 1 AND 5
         AND EXTRACT(HOUR FROM created_at) BETWEEN 9 AND 17
       GROUP BY 1, 2`,
      [jours],
    ),
    db.query(
      `SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom,
         COUNT(d.id_demand)::int AS cloturees,
         ROUND((AVG(EXTRACT(EPOCH FROM (d.closed_at - d.created_at)) / 3600))::numeric, 1)::float AS delai_h,
         ROUND(100.0 * COUNT(d.id_demand) FILTER (WHERE d.closed_at <= d.due_at)
           / NULLIF(COUNT(d.id_demand), 0))::int AS sla
       FROM users u
       JOIN roles r ON r.id_role = u.id_role
       LEFT JOIN demands d ON d.id_assigned_agent = u.id_user AND d.deleted_at IS NULL
         AND d.closed_at >= now() - make_interval(days => $1)
       WHERE UPPER(r.label) = 'AGENT' AND u.is_active = true
       GROUP BY u.id_user, u.first_name, u.last_name
       ORDER BY cloturees DESC, nom`,
      [jours],
    ),
  ]);

  const heatmap = Array.from({ length: 5 }, () => Array<number>(9).fill(0));
  for (const c of chaleur.rows) heatmap[c.jour - 1][c.heure - 9] = c.n;
  const k = kpi.rows[0];

  return {
    kpi: {
      crees: k.crees,
      creesAvant: k.crees_avant,
      delaiMoyenH: k.delai_h,
      slaRespectes: k.sla,
      reouverture: k.reouverture,
      clotureesPeriode: k.cloturees,
    },
    serie: serie.rows.map((r) => ({
      jour: new Date(r.jour).toISOString().slice(0, 10),
      crees: r.crees,
      cloturees: r.cloturees,
    })),
    categories: categories.rows,
    heatmap,
    agents: agents.rows.map((a) => ({
      id: a.id,
      nom: a.nom,
      cloturees: a.cloturees,
      delaiMoyenH: a.delai_h,
      sla: a.sla,
    })),
  };
}
