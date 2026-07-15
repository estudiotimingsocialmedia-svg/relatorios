import { NextRequest, NextResponse } from "next/server";
import { getReportById, updateReport } from "@/db/queries";
import type { ReportBody } from "@/lib/report-html";
import {
  aggregateByMonth,
  classifyMetric,
  formatBrNumber,
  lastMonths,
  monthLabel,
  parseMetaCsv,
  seriesForMonthKeys,
  totalForMonth,
  type MonthlyTotal,
} from "@/lib/parse-csv";

export const runtime = "nodejs";

function setStat(stats: ReportBody["stats"], label: string, value: string) {
  const stat = stats.find((s) => s.label === label);
  if (stat) stat.value = value;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const report = await getReportById(params.id);
  if (!report) {
    return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Envie os arquivos como multipart/form-data." }, { status: 400 });
  }

  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "Nenhum arquivo CSV enviado." }, { status: 400 });
  }

  const warnings: string[] = [];
  let reachMonthly: MonthlyTotal[] | null = null;
  let engagementMonthly: MonthlyTotal[] | null = null;
  let viewsMonthly: MonthlyTotal[] | null = null;

  for (const file of files) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = parseMetaCsv(buffer);
      const kind = classifyMetric(parsed.metricLabel);
      const monthly = aggregateByMonth(parsed.points);

      if (kind === "reach") reachMonthly = monthly;
      else if (kind === "engagement") engagementMonthly = monthly;
      else if (kind === "views") viewsMonthly = monthly;
      else warnings.push(`Não reconheci a métrica do arquivo "${file.name}" ("${parsed.metricLabel}").`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "erro desconhecido";
      warnings.push(`Falha ao ler "${file.name}": ${message}`);
    }
  }

  const referenceMonthly = reachMonthly ?? engagementMonthly ?? viewsMonthly;
  const data = report.data as ReportBody;

  if (referenceMonthly) {
    const recentMonths = lastMonths(referenceMonthly, report.periodSlug, 6);
    const monthKeys = recentMonths.map((m) => m.month);

    data.months = monthKeys.map(monthLabel);
    if (reachMonthly) data.reachSeries = seriesForMonthKeys(reachMonthly, monthKeys);
    if (engagementMonthly) data.engagementSeries = seriesForMonthKeys(engagementMonthly, monthKeys);

    if (reachMonthly) setStat(data.stats, "Alcance total", formatBrNumber(totalForMonth(reachMonthly, report.periodSlug)));
    if (engagementMonthly) setStat(data.stats, "Engajamento", formatBrNumber(totalForMonth(engagementMonthly, report.periodSlug)));
    if (viewsMonthly) setStat(data.stats, "Impressões", formatBrNumber(totalForMonth(viewsMonthly, report.periodSlug)));
  } else {
    warnings.push("Nenhuma das métricas reconhecidas (Alcance, Interações, Visualizações) foi encontrada nos arquivos.");
  }

  const updated = await updateReport(params.id, { data });
  return NextResponse.json({ report: updated, warnings });
}
