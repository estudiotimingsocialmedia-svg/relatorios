import { NextRequest, NextResponse } from "next/server";
import { createDraftReport, findReportByClientAndPeriod, getClientBySlug } from "@/db/queries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const clientSlug = typeof body?.clientSlug === "string" ? body.clientSlug : "";
  const periodSlug = typeof body?.periodSlug === "string" ? body.periodSlug.trim() : "";
  const periodLabel = typeof body?.periodLabel === "string" ? body.periodLabel.trim() : "";

  if (!clientSlug || !periodSlug || !periodLabel) {
    return NextResponse.json(
      { error: "clientSlug, periodSlug e periodLabel são obrigatórios." },
      { status: 400 }
    );
  }

  const client = await getClientBySlug(clientSlug);
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const existing = await findReportByClientAndPeriod(client.id, periodSlug);
  if (existing) {
    return NextResponse.json({ report: existing });
  }

  const report = await createDraftReport(client.id, periodSlug, periodLabel);
  return NextResponse.json({ report }, { status: 201 });
}
