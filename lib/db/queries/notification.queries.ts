import { db } from "@/lib/db";

export type TypeNotification =
  | "ASSIGNATION"
  | "MENTION"
  | "SLA_PROCHE"
  | "SLA_DEPASSE"
  | "STATUT"
  | "COMMENTAIRE";

export type Notification = {
  id: string;
  type: TypeNotification;
  message: string;
  created_at: string;
  read_at: string | null;
  id_demand: string | null;
  id_actor: string | null;
  actor_name: string | null;
};

export type NouvelleNotification = {
  idUser: string;
  type: TypeNotification;
  idDemand?: string | null;
  idActor?: string | null;
  message: string;
};

// Préférence de notification par type (ligne absente = valeurs par défaut : activée)
const PREFERENCE: Partial<Record<TypeNotification, string>> = {
  ASSIGNATION: "notify_assign",
  MENTION: "notify_mention",
  SLA_PROCHE: "notify_sla",
  SLA_DEPASSE: "notify_sla",
};

// Insère les notifications en respectant les préférences, sans notifier l'auteur de l'action
export async function creerNotifications(liste: NouvelleNotification[]) {
  const utiles = liste.filter((n) => n.idUser && n.idUser !== n.idActor);
  for (const n of utiles) {
    const pref = PREFERENCE[n.type];
    const condition = pref
      ? `COALESCE((SELECT ${pref} FROM user_preferences WHERE id_user = $1), true)`
      : "true";
    await db.query(
      `INSERT INTO notifications (id_user, type, id_demand, id_actor, message)
       SELECT $1, $2, $3, $4, $5 WHERE ${condition}`,
      [n.idUser, n.type, n.idDemand ?? null, n.idActor ?? null, n.message],
    );
  }
}

const FILTRES_ONGLET: Record<string, string> = {
  tout: "",
  mentions: "AND n.type = 'MENTION'",
  assignees: "AND n.type = 'ASSIGNATION'",
};

export async function findNotifications(
  idUser: string,
  onglet = "tout",
  limite = 30,
) {
  const r = await db.query(
    `SELECT n.id_notification AS id, n.type, n.message, n.created_at, n.read_at,
            n.id_demand, n.id_actor,
            a.first_name || ' ' || a.last_name AS actor_name
     FROM notifications n
     LEFT JOIN users a ON a.id_user = n.id_actor
     WHERE n.id_user = $1 ${FILTRES_ONGLET[onglet] ?? ""}
     ORDER BY n.created_at DESC
     LIMIT $2`,
    [idUser, limite],
  );
  return r.rows as Notification[];
}

export async function countNonLues(idUser: string) {
  const r = await db.query(
    `SELECT COUNT(*)::int AS n FROM notifications
     WHERE id_user = $1 AND read_at IS NULL`,
    [idUser],
  );
  return r.rows[0].n as number;
}

// ids absent ou vide : tout marquer comme lu
export async function marquerLues(idUser: string, ids?: string[]) {
  await db.query(
    `UPDATE notifications SET read_at = now()
     WHERE id_user = $1 AND read_at IS NULL
       AND ($2::uuid[] IS NULL OR id_notification = ANY($2::uuid[]))`,
    [idUser, ids?.length ? ids : null],
  );
}

// SLA (F4) : SLA_PROCHE (30 min avant l'échéance) et SLA_DEPASSE, une seule fois par demande.
// Destinataire : l'agent assigné. Appelé à chaque lecture des notifications (pas de tâche planifiée).
export async function genererNotificationsSla(idUser: string) {
  await db.query(
    `INSERT INTO notifications (id_user, type, id_demand, message)
     SELECT d.id_assigned_agent, x.type, d.id_demand,
            CASE x.type
              WHEN 'SLA_DEPASSE' THEN 'SLA dépassé : « ' || d.title || ' » attend une réponse'
              ELSE 'SLA bientôt dépassé : « ' || d.title || ' » (moins de 30 min)'
            END
     FROM demands d
     JOIN statuses s ON s.id_status = d.id_status
     CROSS JOIN LATERAL (
       SELECT CASE WHEN d.due_at < now() THEN 'SLA_DEPASSE' ELSE 'SLA_PROCHE' END AS type
     ) x
     WHERE d.id_assigned_agent = $1
       AND d.deleted_at IS NULL
       AND s.label IN ('NOUVELLE', 'EN_COURS')
       AND d.due_at < now() + interval '30 minutes'
       AND COALESCE((SELECT notify_sla FROM user_preferences WHERE id_user = $1), true)
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.id_user = $1 AND n.id_demand = d.id_demand AND n.type = x.type
       )`,
    [idUser],
  );
}

// Personnes « intéressées » par une demande : créateur, agent assigné, abonnés
export async function findInteresses(idDemand: string) {
  const r = await db.query(
    `SELECT DISTINCT id FROM (
       SELECT created_by AS id FROM demands WHERE id_demand = $1
       UNION SELECT id_assigned_agent FROM demands WHERE id_demand = $1
       UNION SELECT id_user FROM demand_watchers WHERE id_demand = $1
     ) t WHERE id IS NOT NULL`,
    [idDemand],
  );
  return r.rows.map((x) => x.id as string);
}
