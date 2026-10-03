import { db } from "@/lib/db";

export type Preferences = {
  motion: boolean;
  density: "confort" | "compact";
  shortcuts: boolean;
  default_view: "liste" | "kanban";
  // Thème d'affichage : sombre (TechLine Care, par défaut) ou clair
  theme: "sombre" | "clair";
  notify_assign: boolean;
  notify_mention: boolean;
  notify_sla: boolean;
  notify_digest: boolean;
};

export const PREFERENCES_DEFAUT: Preferences = {
  motion: true,
  density: "confort",
  shortcuts: true,
  default_view: "liste",
  theme: "sombre",
  notify_assign: true,
  notify_mention: true,
  notify_sla: true,
  notify_digest: false,
};

const BOOLEENS = [
  "motion",
  "shortcuts",
  "notify_assign",
  "notify_mention",
  "notify_sla",
  "notify_digest",
] as const;

// Préférences de l'utilisateur (valeurs par défaut si aucune ligne)
export async function findPreferences(idUser: string): Promise<Preferences> {
  const r = await db.query(
    `SELECT motion, density, shortcuts, default_view, theme, notify_assign, notify_mention,
            notify_sla, notify_digest
     FROM user_preferences WHERE id_user = $1`,
    [idUser],
  );
  return { ...PREFERENCES_DEFAUT, ...(r.rows[0] ?? {}) };
}

// Ne garde que les champs connus, aux valeurs valides
export function nettoyerPreferences(brut: Record<string, unknown>) {
  const p: Partial<Preferences> = {};
  for (const cle of BOOLEENS) {
    if (typeof brut[cle] === "boolean") p[cle] = brut[cle] as boolean;
  }
  if (brut.density === "confort" || brut.density === "compact")
    p.density = brut.density;
  if (brut.default_view === "liste" || brut.default_view === "kanban")
    p.default_view = brut.default_view;
  if (brut.theme === "sombre" || brut.theme === "clair") p.theme = brut.theme;
  return p;
}

// Crée la ligne à la volée puis applique les changements
export async function updatePreferences(
  idUser: string,
  changements: Partial<Preferences>,
): Promise<Preferences> {
  const actuelles = await findPreferences(idUser);
  const p = { ...actuelles, ...changements };
  await db.query(
    `INSERT INTO user_preferences (id_user, motion, density, shortcuts, default_view,
       notify_assign, notify_mention, notify_sla, notify_digest, theme, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
     ON CONFLICT (id_user) DO UPDATE SET
       motion = EXCLUDED.motion, density = EXCLUDED.density,
       shortcuts = EXCLUDED.shortcuts, default_view = EXCLUDED.default_view,
       notify_assign = EXCLUDED.notify_assign, notify_mention = EXCLUDED.notify_mention,
       notify_sla = EXCLUDED.notify_sla, notify_digest = EXCLUDED.notify_digest,
       theme = EXCLUDED.theme,
       updated_at = now()`,
    [
      idUser,
      p.motion,
      p.density,
      p.shortcuts,
      p.default_view,
      p.notify_assign,
      p.notify_mention,
      p.notify_sla,
      p.notify_digest,
      p.theme,
    ],
  );
  return p;
}
