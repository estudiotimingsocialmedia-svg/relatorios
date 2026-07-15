// Aplica os arquivos .sql em src/db/migrations, em ordem, contra o Postgres
// apontado por POSTGRES_URL/DATABASE_URL.
//
// Uso: npm run db:migrate

import { sql } from "@vercel/postgres";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = join(process.cwd(), "src", "db", "migrations");

async function run() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("Nenhuma migration encontrada.");
    return;
  }

  for (const file of files) {
    const content = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const statements = content
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`Aplicando ${file} (${statements.length} comando(s))...`);
    for (const statement of statements) {
      await sql.query(statement);
    }
  }

  console.log("Migrations aplicadas com sucesso.");
}

run().catch((err) => {
  console.error("Falha ao aplicar migrations:", err);
  process.exit(1);
});
