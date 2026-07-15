import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clients, reports } from "@/db/schema";
import { assembleReportData, buildReportHTML, type ReportBody } from "@/lib/report-html";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { clientSlug: string; periodSlug: string } }
) {
  const { clientSlug, periodSlug } = params;

  const rows = await db
    .select({
      slug: clients.slug,
      name: clients.name,
      niche: clients.niche,
      instagramHandle: clients.instagramHandle,
      periodSlug: reports.periodSlug,
      periodLabel: reports.periodLabel,
      status: reports.status,
      data: reports.data,
    })
    .from(reports)
    .innerJoin(clients, eq(reports.clientId, clients.id))
    .where(
      and(eq(clients.slug, clientSlug), eq(reports.periodSlug, periodSlug), eq(reports.status, "published"))
    )
    .limit(1);

  const row = rows[0];
  if (!row) {
    return new NextResponse("Relatório não encontrado.", { status: 404 });
  }

  const html = buildReportHTML(
    assembleReportData(
      { slug: row.slug, name: row.name, niche: row.niche, instagramHandle: row.instagramHandle },
      { periodSlug: row.periodSlug, periodLabel: row.periodLabel, data: row.data as ReportBody }
    )
  );

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
