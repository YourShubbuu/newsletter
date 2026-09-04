import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required for migrations");

const sql = postgres(databaseUrl, { max: 1, prepare: false });
const migrationsDir = join(__dirname, "../drizzle");

async function migrate() {
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS "__news_migrations" (
      "id" text PRIMARY KEY,
      "applied_at" timestamptz NOT NULL DEFAULT now()
    )
  `);

  await sql.unsafe(`SELECT pg_advisory_lock(hashtext('news-platform-migrations'))`);
  try {
    const applied = await sql.unsafe<{ id: string }[]>(`SELECT "id" FROM "__news_migrations"`);
    const appliedIds = new Set(applied.map((row) => row.id));
    const files = (await readdir(migrationsDir))
      .filter((file) => /^\d+_.+\.sql$/.test(file))
      .sort();

    for (const file of files) {
      if (appliedIds.has(file)) continue;
      const contents = await readFile(join(migrationsDir, file), "utf8");
      console.log(`Applying migration ${file}`);
      await sql.begin(async (tx) => {
        await tx.unsafe(contents);
        await tx.unsafe(`INSERT INTO "__news_migrations" ("id") VALUES ($1)`, [file]);
      });
    }

    console.log(`Database migrations complete (${files.length} known).`);
  } finally {
    await sql.unsafe(`SELECT pg_advisory_unlock(hashtext('news-platform-migrations'))`);
  }
}

migrate()
  .catch((error) => {
    console.error("Database migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sql.end();
  });
