import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./index";
import { clients, reports } from "./schema";
import type { ReportBody } from "@/lib/report-html";

const RESERVED_SLUGS = new Set(["login", "projetos", "api"]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export async function listClientsWithReportCounts() {
  return db
    .select({
      id: clients.id,
      slug: clients.slug,
      name: clients.name,
      niche: clients.niche,
      instagramHandle: clients.instagramHandle,
      objective: clients.objective,
      createdAt: clients.createdAt,
      publishedCount: sql<number>`count(*) filter (where ${reports.status} = 'published')`.mapWith(Number),
      draftCount: sql<number>`count(*) filter (where ${reports.status} = 'draft')`.mapWith(Number),
    })
    .from(clients)
    .leftJoin(reports, eq(reports.clientId, clients.id))
    .where(eq(clients.archived, false))
    .groupBy(clients.id)
    .orderBy(clients.name);
}

export async function getClientBySlug(slug: string) {
  const rows = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  return rows[0] ?? null;
}

export async function listReportsForClient(clientId: string) {
  return db
    .select()
    .from(reports)
    .where(eq(reports.clientId, clientId))
    .orderBy(desc(reports.createdAt));
}

export async function getReportById(reportId: string) {
  const rows = await db.select().from(reports).where(eq(reports.id, reportId)).limit(1);
  return rows[0] ?? null;
}

export async function createClient(input: {
  slug: string;
  name: string;
  niche?: string;
  instagramHandle?: string;
  objective?: string;
}) {
  const rows = await db
    .insert(clients)
    .values({
      slug: input.slug,
      name: input.name,
      niche: input.niche || null,
      instagramHandle: input.instagramHandle || null,
      objective: input.objective || null,
    })
    .returning();
  return rows[0];
}

export const emptyReportBody: ReportBody = {
  months: [],
  reachSeries: [],
  engagementSeries: [],
  stats: [
    { label: "Conteúdos publicados", value: "" },
    { label: "Alcance total", value: "" },
    { label: "Engajamento", value: "" },
    { label: "Taxa de engajamento", value: "" },
    { label: "Visitas ao perfil", value: "" },
    { label: "Cliques em link", value: "" },
    { label: "Seguidores ganhos", value: "" },
    { label: "Impressões", value: "" },
  ],
  topPosts: [],
  followerPosts: [],
  linkClicksTotal: "",
  profileVisitsTotal: "",
  formatDistribution: [],
  ideaBlocks: [
    { label: "Ideias de conteúdo", cards: [] },
    { label: "Temas em alta", cards: [] },
    { label: "Possibilidades comerciais", cards: [] },
  ],
};

export async function createDraftReport(clientId: string, periodSlug: string, periodLabel: string) {
  const rows = await db
    .insert(reports)
    .values({
      clientId,
      periodSlug,
      periodLabel,
      status: "draft",
      data: emptyReportBody,
    })
    .returning();
  return rows[0];
}

export async function updateReport(
  reportId: string,
  updates: { data?: ReportBody; periodLabel?: string; status?: "draft" | "published" }
) {
  const rows = await db
    .update(reports)
    .set({
      data: updates.data,
      periodLabel: updates.periodLabel,
      status: updates.status,
      publishedAt: updates.status === "published" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportId))
    .returning();
  return rows[0] ?? null;
}

export async function findReportByClientAndPeriod(clientId: string, periodSlug: string) {
  const rows = await db
    .select()
    .from(reports)
    .where(and(eq(reports.clientId, clientId), eq(reports.periodSlug, periodSlug)))
    .limit(1);
  return rows[0] ?? null;
}
