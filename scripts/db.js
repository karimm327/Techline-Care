require("dotenv").config({ path: "..env.local" });

const {readFileSync} = require("fs");
const {Pool} = require("pg");

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL non défini");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const action = process.argv[2]; // schema | seed | reset

const schemaPath = "lib/db/scripts/v1/schema.sql";
const seedPath = "lib/db/scripts/v1/seed.sql";

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
                break;

            case "seed":
                await runSeed();
                break;

            case "reset":
                await runSchema();
                await runSeed();
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

async function runSeed() {
    console.log("Exécution seed.sql...");
    const seedSql = readFileSync(seedPath, "utf-8");
    await pool.query(seedSql);
}

run();
