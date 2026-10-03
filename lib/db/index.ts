import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, type QueryResult } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL n'est pas configuré");
}

// En développement, Next.js recharge les fichiers à chaque modification :
// sans ça, un NOUVEAU pool de connexions serait créé à chaque fois, jusqu'à saturer
// le serveur PostgreSQL (les requêtes restent alors bloquées = "Rendering" sans fin).
const globalPourPg = globalThis as unknown as {
  pgPool?: Pool;
  pgMigration?: Promise<void>;
};

const pool =
  globalPourPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });

if (!globalPourPg.pgPool) {
  const fuseau = (
    Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris"
  ).replace(/'/g, "");
  pool.on("connect", (client) => {
    client.query(`SET TIME ZONE '${fuseau}'`).catch(() => {});
  });
}

// Migrations idempotentes exécutées au démarrage, dans l'ordre (n'effacent rien)
const MIGRATIONS = [
  "lib/db/scripts/v1/migration-journal.sql",
  "lib/db/scripts/v2/migration-refonte.sql",
];

const migration =
  globalPourPg.pgMigration ??
  (async () => {
    for (const fichier of MIGRATIONS) {
      try {
        const sql = readFileSync(path.join(process.cwd(), fichier), "utf-8");
        await pool.query(sql);
      } catch (e) {
        console.error(
          "⚠️ Mise à jour automatique de la base impossible :",
          (e as Error).message,
        );
        console.error(`   → Lance ${fichier} dans pgAdmin.`);
        // Une migration en échec bloque les suivantes (elles en dépendent)
        return;
      }
    }
  })();

if (process.env.NODE_ENV !== "production") {
  globalPourPg.pgPool = pool;
  globalPourPg.pgMigration = migration;
}

export const db = {
  // biome-ignore lint/suspicious/noExplicitAny: lignes SQL brutes, typées à l'usage
  async query(texte: string, valeurs?: unknown[]): Promise<QueryResult<any>> {
    await migration;
    return pool.query(texte, valeurs);
  },
};
