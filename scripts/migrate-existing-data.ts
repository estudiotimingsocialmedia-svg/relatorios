// Importa os relatórios que hoje vivem como arquivos em /data (formato antigo do
// gerador estático) para o Postgres, criando o client e o report (status='published')
// correspondentes.
//
// Uso: npm run migrate-existing-data

import { sql } from "@vercel/postgres";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import type { ReportBody } from "../src/lib/report-html";

const DATA_DIR = join(process.cwd(), "data");

interface LegacyReportFile extends ReportBody {
  clientSlug: string;
  clientName: string;
  niche: string;
  instagramHandle: string;
  periodLabel: string;
  periodSlug: string;
}

async function upsertClient(file: LegacyReportFile) {
  const existing = await sql`select id from clients where slug = ${file.clientSlug} limit 1`;
  if (existing.rows[0]) {
    return existing.rows[0].id as string;
  }

  const inserted = await sql`
    insert into clients (slug, name, niche, instagram_handle)
    values (${file.clientSlug}, ${file.clientName}, ${file.niche}, ${file.instagramHandle})
    returning id
  `;
  return inserted.rows[0].id as string;
}

async function upsertReport(clientId: string, file: LegacyReportFile) {
  const body: ReportBody = {
    months: file.months,
    reachSeries: file.reachSeries,
    engagementSeries: file.engagementSeries,
    stats: file.stats,
    topPosts: file.topPosts,
    followerPosts: file.followerPosts,
    linkClicksTotal: file.linkClicksTotal,
    profileVisitsTotal: file.profileVisitsTotal,
    formatDistribution: file.formatDistribution,
    ideaBlocks: file.ideaBlocks,
  };

  await sql`
    insert into reports (client_id, period_slug, period_label, status, data, published_at)
    values (${clientId}, ${file.periodSlug}, ${file.periodLabel}, 'published', ${JSON.stringify(body)}::jsonb, now())
    on conflict (client_id, period_slug)
    do update set data = excluded.data, period_label = excluded.period_label, status = 'published', published_at = now(), updated_at = now()
  `;
}

async function run() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("Nenhum arquivo em /data para migrar.");
    return;
  }

  for (const file of files) {
    const parsed = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8")) as LegacyReportFile;
    const clientId = await upsertClient(parsed);
    await upsertReport(clientId, parsed);
    console.log(`Migrado: ${parsed.clientSlug}/${parsed.periodSlug}`);
  }

  console.log("Migração concluída.");
}

run().catch((err) => {
  console.error("Falha na migração:", err);
  process.exit(1);
});
