// Rota de configuração única: cria as tabelas do Postgres. Protegida pelo
// middleware (exige login) já que fica sob /api/. Idempotente — pode ser
// visitada mais de uma vez sem problema (usa "if not exists").
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  await sql`create extension if not exists "pgcrypto"`;

  await sql`
    create table if not exists clients (
      id uuid primary key default gen_random_uuid(),
      slug text unique not null,
      name text not null,
      niche text,
      instagram_handle text,
      objective text,
      archived boolean not null default false,
      created_at timestamptz not null default now()
    )
  `;

  await sql`
    create table if not exists reports (
      id uuid primary key default gen_random_uuid(),
      client_id uuid not null references clients(id) on delete cascade,
      period_slug text not null,
      period_label text not null,
      status text not null default 'draft' check (status in ('draft', 'published')),
      data jsonb not null,
      published_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (client_id, period_slug)
    )
  `;

  return NextResponse.json({ ok: true, message: "Tabelas criadas (ou já existentes)." });
}
