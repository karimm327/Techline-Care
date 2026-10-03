import { readFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { Pool, type QueryResult } from "pg";
import { configurationPool } from "./configuration";

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
    ...configurationPool(),
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });

if (!globalPourPg.pgPool) {
  // Fuseau de la base = celui de l'équipe (TZ, Europe/Paris par défaut) même si le serveur est en UTC
  const fuseau = (process.env.TZ || "Europe/Paris").replace(/'/g, "");
  pool.on("connect", (client) => {
    client.query(`SET TIME ZONE '${fuseau}'`).catch(() => {});
  });
}

import { marquerRevoquees } from "@/lib/auth/revocations";

// Diagnostic sans secret : hôte, port, base, SSL (jamais le mot de passe)
function cibleConnexion(): string {
  const config = configurationPool();
  try {
    const u = new URL(config.connectionString ?? "");
    return `${u.hostname || "(hôte vide)"}:${u.port || "5432"}/${u.pathname.slice(1)} · utilisateur ${u.username || "(vide)"} · SSL ${config.ssl ? "avec certificat" : "désactivé"}`;
  } catch {
    return "DATABASE_URL illisible (doit commencer par postgres://)";
  }
}

// Le port de la base est-il joignable (TCP), et répond-il à une demande SSL PostgreSQL ?
function sondeReseau(): Promise<string> {
  let hote = "";
  let port = 5432;
  try {
    const u = new URL(configurationPool().connectionString ?? "");
    hote = u.hostname;
    port = Number(u.port) || 5432;
  } catch {
    return Promise.resolve("URL illisible");
  }
  return new Promise((resoudre) => {
    const debut = Date.now();
    const socket = net.connect({ host: hote, port });
    const fin = (texte: string) => {
      socket.destroy();
      resoudre(
        `${texte} (${Date.now() - debut} ms, ${socket.remoteAddress ?? "IP inconnue"})`,
      );
    };
    socket.setTimeout(8000, () => fin("AUCUNE réponse TCP : port bloqué"));
    socket.on("error", (e) =>
      fin(`erreur TCP ${(e as NodeJS.ErrnoException).code ?? e.message}`),
    );
    socket.on("connect", () => {
      // SSLRequest PostgreSQL : le serveur répond « S » s'il accepte le SSL
      socket.write(Buffer.from([0, 0, 0, 8, 0x04, 0xd2, 0x16, 0x2f]));
    });
    socket.on("data", (d) =>
      fin(`TCP OK, réponse SSL « ${String.fromCharCode(d[0])} »`),
    );
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
        console.error(`   Connexion tentée : ${cibleConnexion()}`);
        console.error(`   Test réseau : ${await sondeReseau()}`);
        console.error(`   → Lance ${fichier} dans pgAdmin.`);
        // Une migration en échec bloque les suivantes (elles en dépendent)
        return;
      }
    }
    // Sessions révoquées encore valides (jetons de 30 jours au plus)
    try {
      const r = await pool.query(
        "SELECT id_session FROM user_sessions WHERE revoked_at > now() - interval '31 days'",
      );
      marquerRevoquees(r.rows.map((l) => l.id_session as string));
    } catch {
      // table absente (migration en échec) : aucune révocation à charger
    }
  })();

if (process.env.NODE_ENV !== "production") {
  globalPourPg.pgPool = pool;
  globalPourPg.pgMigration = migration;
}

// biome-ignore lint/suspicious/noExplicitAny: lignes SQL brutes, typées à l'usage
type LigneSql = any;

// Requête dans une transaction (même signature que db.query)
export type Requete = (
  texte: string,
  valeurs?: unknown[],
) => Promise<QueryResult<LigneSql>>;

export const db = {
  // biome-ignore lint/suspicious/noExplicitAny: lignes SQL brutes, typées à l'usage
  async query(texte: string, valeurs?: unknown[]): Promise<QueryResult<any>> {
    await migration;
    return pool.query(texte, valeurs);
  },

  // Plusieurs requêtes tout-ou-rien : COMMIT si la fonction réussit, ROLLBACK sinon
  async transaction<T>(travail: (q: Requete) => Promise<T>): Promise<T> {
    await migration;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const resultat = await travail((texte, valeurs) =>
        client.query(texte, valeurs),
      );
      await client.query("COMMIT");
      return resultat;
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {});
      throw e;
    } finally {
      client.release();
    }
  },
};
