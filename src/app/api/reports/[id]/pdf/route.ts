import { NextRequest, NextResponse } from "next/server";
import { getReportById, updateReport } from "@/db/queries";
import type { ReportBody } from "@/lib/report-html";
import { extractMetaBusinessSuitePdf, type PdfExtractionResult } from "@/lib/extract-pdf";
import { formatBrNumber } from "@/lib/parse-csv";

export const runtime = "nodejs";

function setStatIfEmpty(stats: ReportBody["stats"], label: string, value: string) {
  const stat = stats.find((s) => s.label === label);
  if (stat && !stat.value) stat.value = value;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const report = await getReportById(params.id);
  if (!report) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um arquivo PDF no campo 'file'." }, { status: 400 });
  }

  let extraction: PdfExtractionResult;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    extraction = await extractMetaBusinessSuitePdf(buffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro desconhecido";
    return NextResponse.json({ error: `Falha ao ler o PDF: ${message}` }, { status: 502 });
  }

  const data = report.data as ReportBody;

  if (extraction.totalReach != null) setStatIfEmpty(data.stats, "Alcance total", formatBrNumber(extraction.totalReach));
  if (extraction.totalInteractions != null) setStatIfEmpty(data.stats, "Engajamento", formatBrNumber(extraction.totalInteractions));
  if (extraction.totalViews != null) setStatIfEmpty(data.stats, "Impressões", formatBrNumber(extraction.totalViews));

  const updated = await updateReport(params.id, {
    data,
    periodLabel: !report.periodLabel && extraction.periodLabel ? extraction.periodLabel : undefined,
  });

  return NextResponse.json({ report: updated, extraction });
}
