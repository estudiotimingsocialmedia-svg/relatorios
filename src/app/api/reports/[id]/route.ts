import { NextRequest, NextResponse } from "next/server";
import { getReportById, updateReport } from "@/db/queries";
import type { ReportBody } from "@/lib/report-html";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const report = await getReportById(params.id);
  if (!report) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ report });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const existing = await getReportById(params.id);
  if (!existing) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo da requisição inválido." }, { status: 400 });
  }

  const updates: { data?: ReportBody; periodLabel?: string; status?: "draft" | "published" } = {};
  if (body.data) updates.data = body.data as ReportBody;
  if (typeof body.periodLabel === "string") updates.periodLabel = body.periodLabel;
  if (body.status === "draft" || body.status === "published") updates.status = body.status;

  const updated = await updateReport(params.id, updates);
  return NextResponse.json({ report: updated });
}
