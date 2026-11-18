// Apply SQL migrations in db/migrations in order, once each, inside a transaction.
// Uses the DIRECT connection (DATABASE_URL_UNPOOLED), as Neon recommends for schema changes.
// Run: npm run db:migrate
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

// pg already treats sslmode=require as verify-full; say so explicitly (strict TLS, no warning)
const url = (process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || "").replace("sslmode=require", "sslmode=verify-full");
if (!url) {
  console.error("DATABASE_URL_UNPOOLED is not set. Run `neon env pull` (or `neon deploy`) first.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "db", "migrations");
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )`);
  const done = new Set((await client.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
  let applied = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`applied  ${file}`);
      applied++;
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`${file} failed: ${err.message}`);
    }
  }
  console.log(applied ? `${applied} migration(s) applied.` : "Database is up to date.");
} finally {
  await client.end();
}
