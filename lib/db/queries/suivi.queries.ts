import { db } from "@/lib/db";

/* ---------- Abonnés (F11) ---------- */

export type Abonne = { id: string; nom: string; explicite: boolean };

// Personnes qui suivent une demande : créateur et agent (automatiquement) + abonnés explicites
export async function findAbonnes(idDemand: string) {
  const r = await db.query(
    `SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom,
            bool_or(t.explicite) AS explicite
     FROM (
       SELECT created_by AS id, false AS explicite FROM demands WHERE id_demand = $1
       UNION ALL SELECT id_assigned_agent, false FROM demands WHERE id_demand = $1
       UNION ALL SELECT id_user, true FROM demand_watchers WHERE id_demand = $1
     ) t
     JOIN users u ON u.id_user = t.id
     GROUP BY u.id_user, u.first_name, u.last_name
     ORDER BY nom`,
    [idDemand],
  );
  return r.rows as Abonne[];
}

export async function ajouterAbonne(idDemand: string, idUser: string) {
  await db.query(
    `INSERT INTO demand_watchers (id_demand, id_user) VALUES ($1, $2)
     ON CONFLICT DO NOTHING`,
    [idDemand, idUser],
  );
}

export async function retirerAbonne(idDemand: string, idUser: string) {
  await db.query(
    "DELETE FROM demand_watchers WHERE id_demand = $1 AND id_user = $2",
    [idDemand, idUser],
  );
}

/* ---------- Demandes liées (F11) ---------- */

export type DemandeLiee = {
  id: string;
  title: string;
  status: string;
  kind: "LIEE" | "DOUBLON";
  supprimee: boolean;
};

// Liens dans les deux sens (A → B s'affiche aussi sur B)
export async function findDemandesLiees(idDemand: string) {
  const r = await db.query(
    `SELECT d.id_demand AS id, d.title, s.label AS status, l.kind,
            d.deleted_at IS NOT NULL AS supprimee
     FROM demand_links l
     JOIN demands d ON d.id_demand =
       CASE WHEN l.id_demand_a = $1 THEN l.id_demand_b ELSE l.id_demand_a END
     JOIN statuses s ON s.id_status = d.id_status
     WHERE l.id_demand_a = $1 OR l.id_demand_b = $1
     ORDER BY l.created_at`,
    [idDemand],
  );
  return r.rows as DemandeLiee[];
}

// Référence « #7B20E1AA », préfixe ou identifiant complet → demande unique non supprimée
export async function trouverParReference(saisie: string) {
  const terme = saisie.trim().replace(/^#/, "").toLowerCase();
  if (!/^[0-9a-f-]{6,36}$/.test(terme)) return null;
  const r = await db.query(
    `SELECT id_demand FROM demands
     WHERE id_demand::text LIKE $1 || '%' AND deleted_at IS NULL
     LIMIT 2`,
    [terme],
  );
  return r.rows.length === 1 ? (r.rows[0].id_demand as string) : null;
}

// Lien non orienté : stocké une seule fois (plus petit identifiant en premier)
export async function lierDemandes(
  a: string,
  b: string,
  kind: "LIEE" | "DOUBLON",
  idUser: string,
) {
  const [x, y] = a < b ? [a, b] : [b, a];
  await db.query(
    `INSERT INTO demand_links (id_demand_a, id_demand_b, kind, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (id_demand_a, id_demand_b) DO UPDATE SET kind = EXCLUDED.kind`,
    [x, y, kind, idUser],
  );
}

export async function delierDemandes(a: string, b: string) {
  const r = await db.query(
    `DELETE FROM demand_links
     WHERE (id_demand_a = $1 AND id_demand_b = $2) OR (id_demand_a = $2 AND id_demand_b = $1)`,
    [a, b],
  );
  return (r.rowCount ?? 0) > 0;
}

/* ---------- Présence (F12) ---------- */

export async function signalerPresence(
  idUser: string,
  idDemand: string,
  etat: "VIEW" | "TYPING",
) {
  await db.query(
    `INSERT INTO presence (id_user, id_demand, state, last_seen_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (id_user, id_demand) DO UPDATE SET state = EXCLUDED.state, last_seen_at = now()`,
    [idUser, idDemand, etat],
  );
}

// Autres personnes sur la fiche : vues depuis moins de 30 s ; « en train d'écrire » si signal < 6 s
export async function findPresents(idDemand: string, idMoi: string) {
  const r = await db.query(
    `SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom,
            (p.state = 'TYPING' AND p.last_seen_at > now() - interval '6 seconds') AS ecrit
     FROM presence p JOIN users u ON u.id_user = p.id_user
     WHERE p.id_demand = $1 AND p.id_user <> $2
       AND p.last_seen_at > now() - interval '30 seconds'
     ORDER BY u.first_name`,
    [idDemand, idMoi],
  );
  return r.rows as { id: string; nom: string; ecrit: boolean }[];
}

// Équipe en ligne : activité (session ou fiche consultée) dans les 5 dernières minutes
export async function findEquipeEnLigne() {
  const r = await db.query(
    `SELECT u.id_user AS id, u.first_name || ' ' || u.last_name AS nom
     FROM users u
     WHERE u.is_active = true AND (
       EXISTS (SELECT 1 FROM user_sessions s WHERE s.id_user = u.id_user
                 AND s.revoked_at IS NULL AND s.last_seen_at > now() - interval '5 minutes')
       OR EXISTS (SELECT 1 FROM presence p WHERE p.id_user = u.id_user
                 AND p.last_seen_at > now() - interval '5 minutes'))
     ORDER BY u.first_name
     LIMIT 50`,
  );
  return r.rows as { id: string; nom: string }[];
}
