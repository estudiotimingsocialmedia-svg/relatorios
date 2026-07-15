// Parser para os exports de série diária do Meta Business Suite
// (Interações.csv, Alcance.csv, Visualizações.csv): arquivos UTF-16LE no formato
//   sep=,
//   "Nome da métrica"
//   "Data","Primary"
//   "2026-01-01T00:00:00","30"
//   ...

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

export interface ParsedMetricCsv {
  metricLabel: string;
  points: DailyPoint[];
}

const MONTH_LABELS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export function monthLabel(monthKey: string): string {
  const monthIndex = Number(monthKey.split("-")[1]) - 1;
  return MONTH_LABELS_PT[monthIndex] ?? monthKey;
}

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

export function normalizeLabel(value: string): string {
  return stripAccents(value).toLowerCase().trim();
}

export function parseMetaCsv(buffer: Buffer): ParsedMetricCsv {
  let text = buffer.toString("utf16le");
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 3) {
    throw new Error("Arquivo CSV vazio ou em formato inesperado.");
  }

  const metricLabel = lines[1].replace(/^"|"$/g, "");
  const points: DailyPoint[] = [];

  for (const line of lines.slice(2)) {
    const match = line.match(/^"([^"]+)","([^"]*)"$/);
    if (!match) continue;
    const [, dateRaw, valueRaw] = match;
    if (dateRaw.toLowerCase() === "data") continue; // linha de cabeçalho
    const value = Number(valueRaw);
    if (Number.isNaN(value)) continue;
    points.push({ date: dateRaw.slice(0, 10), value });
  }

  return { metricLabel, points };
}

export interface MonthlyTotal {
  month: string; // YYYY-MM
  total: number;
}

export function aggregateByMonth(points: DailyPoint[]): MonthlyTotal[] {
  const totals = new Map<string, number>();
  for (const p of points) {
    const monthKey = p.date.slice(0, 7);
    totals.set(monthKey, (totals.get(monthKey) ?? 0) + p.value);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));
}

/** Recorta os últimos `monthsBack` meses de uma série mensal, terminando no
 * mês do período do relatório (ou no último mês disponível, se o período
 * ainda não tiver dados). */
export function lastMonths(monthlyTotals: MonthlyTotal[], periodMonthKey: string, monthsBack = 6): MonthlyTotal[] {
  const sorted = [...monthlyTotals].sort((a, b) => a.month.localeCompare(b.month));
  const idx = sorted.findIndex((m) => m.month === periodMonthKey);
  const endIdx = idx === -1 ? sorted.length - 1 : idx;
  const startIdx = Math.max(0, endIdx - (monthsBack - 1));
  return sorted.slice(startIdx, endIdx + 1);
}

export function seriesForMonthKeys(monthlyTotals: MonthlyTotal[], monthKeys: string[]): number[] {
  const byMonth = new Map(monthlyTotals.map((m) => [m.month, m.total]));
  return monthKeys.map((key) => byMonth.get(key) ?? 0);
}

export function totalForMonth(monthlyTotals: MonthlyTotal[], monthKey: string): number {
  return monthlyTotals.find((m) => m.month === monthKey)?.total ?? 0;
}

export function formatBrNumber(n: number): string {
  if (Math.abs(n) >= 10000) {
    const thousands = n / 1000;
    const hasFraction = Math.round(thousands * 10) % 10 !== 0;
    return (
      thousands.toLocaleString("pt-BR", {
        maximumFractionDigits: 1,
        minimumFractionDigits: hasFraction ? 1 : 0,
      }) + " mil"
    );
  }
  return Math.round(n).toLocaleString("pt-BR");
}

export type MetricKind = "reach" | "engagement" | "views";

export function classifyMetric(metricLabel: string): MetricKind | null {
  const normalized = normalizeLabel(metricLabel);
  if (normalized.includes("intera")) return "engagement";
  if (normalized.includes("alcance")) return "reach";
  if (normalized.includes("visualiza")) return "views";
  return null;
}
