require("dotenv").config({ path: ".env.local" });

const { readFileSync } = require("node:fs");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL non défini");
  process.exit(1);
}

// Base hébergée (Aiven) : certificat CA dans DATABASE_CA_CERT (même logique que lib/db/configuration.ts)
function configurationPool() {
  // « \n » littéraux (variable sur une seule ligne) → vrais retours à la ligne
  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  if (!ca) return { connectionString: process.env.DATABASE_URL };
  const url = process.env.DATABASE_URL.replace(
    /([?&])sslmode=[^&]*(&|$)/,
    (_, avant, apres) => (avant === "?" && apres ? "?" : apres ? avant : ""),
  ).replace(/\?$/, "");
  return {
    connectionString: url,
    ssl: { ca, rejectUnauthorized: true },
  };
}

const pool = new Pool(configurationPool());

const action = process.argv[2]; // schema | seed | reset | hacher

const schemaPath = "lib/db/scripts/v1/schema.sql";
const seedPath = "lib/db/scripts/v1/seed.sql";
// Migrations appliquées après le schéma (la base neuve a ainsi les tables de la refonte)
const migrations = [
  "lib/db/scripts/v1/migration-journal.sql",
  "lib/db/scripts/v2/migration-refonte.sql",
];

async function run() {
  if (!action) {
    console.error("Action manquante : schema | seed | reset");
    process.exit(1);
  }

  try {
    await pool.query("BEGIN");

    switch (action) {
      case "schema":
        await runSchema();
        await runMigrations();
        break;

      case "seed":
        await runSeed();
        await runMigrations();
        await hacherMotsDePasse();
        break;

      case "hacher":
        await hacherMotsDePasse();
        break;

      case "reset":
        await runSchema();
        await runSeed();
        await runMigrations();
        await hacherMotsDePasse();
        break;

      default:
        throw new Error("Action inconnue");
    }

    await pool.query("COMMIT");
    console.log("Opération terminée");
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Erreur :", err);
  } finally {
    await pool.end();
  }
}

async function runSchema() {
  console.log("Exécution schema.sql...");
  const schemaSql = readFileSync(schemaPath, "utf-8");
  await pool.query(schemaSql);
}

// Toujours après le schéma et le seed : les migrations complètent les données (SLA, triggers)
async function runMigrations() {
  for (const m of migrations) {
    console.log(`Exécution ${m}...`);
    await pool.query(readFileSync(m, "utf-8"));
  }
}

async function runSeed() {
  console.log("Exécution seed.sql...");
  // Mot de passe des comptes de test : jamais dans le dépôt, fourni par SEED_PASSWORD (.env.local)
  const motDePasse = process.env.SEED_PASSWORD;
  if (!motDePasse) {
    throw new Error("SEED_PASSWORD non défini (mot de passe des comptes de test)");
  }
  const seedSql = readFileSync(seedPath, "utf-8").replaceAll(
    "'__MOT_DE_PASSE_SEED__'",
    `'${motDePasse.replaceAll("'", "''")}'`,
  );
  await pool.query(seedSql);
}

// Remplace chaque mot de passe encore en clair par son empreinte bcrypt (les comptes gardent le même mot de passe)
async function hacherMotsDePasse() {
  const r = await pool.query(
    "SELECT id_user, password FROM techlinecare.users WHERE password !~ '^\\$2[aby]\\$[0-9]{2}\\$'",
  );
  for (const u of r.rows) {
    const empreinte = await bcrypt.hash(u.password, 12);
    await pool.query(
      "UPDATE techlinecare.users SET password = $1 WHERE id_user = $2",
      [empreinte, u.id_user],
    );
  }
  console.log(`Mots de passe hachés : ${r.rows.length}`);
}

run();
