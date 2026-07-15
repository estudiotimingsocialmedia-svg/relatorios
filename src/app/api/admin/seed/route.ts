// Rota de configuração única: importa o relatório existente (data/joybeauty-2026-06.json,
// formato do gerador estático antigo) para o Postgres. Protegida pelo middleware.
// Idempotente — usa upsert por (client_id, period_slug).
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import legacyReport from "@data/joybeauty-2026-06.json";

export const runtime = "nodejs";

export async function GET() {
  const {
    clientSlug,
    clientName,
    niche,
    instagramHandle,
    periodLabel,
    periodSlug,
    ...body
  } = legacyReport;

  const existingClient = await sql`select id from clients where slug = ${clientSlug} limit 1`;

  const clientId = existingClient.rows[0]
    ? (existingClient.rows[0].id as string)
    : (
        await sql`
          insert into clients (slug, name, niche, instagram_handle)
          values (${clientSlug}, ${clientName}, ${niche}, ${instagramHandle})
          returning id
        `
      ).rows[0].id as string;

  await sql`
    insert into reports (client_id, period_slug, period_label, status, data, published_at)
    values (${clientId}, ${periodSlug}, ${periodLabel}, 'published', ${JSON.stringify(body)}::jsonb, now())
    on conflict (client_id, period_slug)
    do update set data = excluded.data, period_label = excluded.period_label, status = 'published', published_at = now(), updated_at = now()
  `;

  return NextResponse.json({ ok: true, message: `Importado: ${clientSlug}/${periodSlug}` });
}
