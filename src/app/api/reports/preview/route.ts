import { NextRequest, NextResponse } from "next/server";
import { assembleReportData, buildReportHTML, type ReportBody } from "@/lib/report-html";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const { client, periodSlug, periodLabel, data } = body as {
    client: { slug: string; name: string; niche: string | null; instagramHandle: string | null };
    periodSlug: string;
    periodLabel: string;
    data: ReportBody;
  };

  try {
    const html = buildReportHTML(assembleReportData(client, { periodSlug, periodLabel, data }));
    return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: `Falha ao gerar prévia: ${message}` }, { status: 400 });
  }
}
