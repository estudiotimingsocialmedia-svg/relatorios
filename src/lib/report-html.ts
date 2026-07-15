import { REPORT_TEMPLATE } from "@/templates/report-template";

export interface StatCell {
  label: string;
  value: string;
}

export interface RankItem {
  format: string;
  caption: string;
  statsLine: string;
  total: string;
}

export interface FormatDistributionItem {
  label: string;
  count: number;
}

export interface IdeaCard {
  title: string;
  tag?: string;
  desc: string;
}

export interface IdeaBlock {
  label: string;
  cards: IdeaCard[];
}

export interface ReportData {
  clientSlug: string;
  clientName: string;
  niche: string;
  instagramHandle: string;
  periodLabel: string;
  periodSlug: string;
  months: string[];
  reachSeries: number[];
  engagementSeries: number[];
  stats: StatCell[];
  topPosts: RankItem[];
  followerPosts: RankItem[];
  linkClicksTotal: string;
  profileVisitsTotal: string;
  formatDistribution: FormatDistributionItem[];
  ideaBlocks: IdeaBlock[];
}

function renderStatCells(stats: StatCell[]): string {
  return stats
    .map(
      (s) => `
      <div class="stat-cell">
        <p class="stat-label">${s.label}</p>
        <p class="stat-value display-italic">${s.value}</p>
      </div>`
    )
    .join("");
}

function renderRankList(items: RankItem[]): string {
  return items
    .map(
      (item, i) => `
      <li class="rank-item">
        <span class="rank-num display-italic">${String(i + 1).padStart(2, "0")}</span>
        <div class="rank-thumb"></div>
        <div class="rank-body">
          <p class="rank-format">${item.format}</p>
          <p class="rank-caption">${item.caption}</p>
          <div class="rank-stats"><span>${item.statsLine}</span></div>
        </div>
        <div class="rank-right">
          <p class="rank-total display-italic">${item.total}</p>
        </div>
      </li>`
    )
    .join("");
}

function renderPills(items: FormatDistributionItem[]): string {
  return items
    .map((i) => `<span class="pill">${i.label}<b>${i.count}</b></span>`)
    .join("");
}

function renderIdeaBlocks(blocks: IdeaBlock[]): string {
  return blocks
    .map(
      (block) => `
    <div class="idea-block">
      <p class="idea-label">${block.label}</p>
      <div class="idea-grid">
        ${block.cards
          .map(
            (c) => `
        <div class="idea-card">
          <p class="idea-title display-italic">${c.title}</p>
          ${c.tag ? `<p class="idea-tag">${c.tag}</p>` : ""}
          <p class="idea-desc">${c.desc}</p>
        </div>`
          )
          .join("")}
      </div>
    </div>`
    )
    .join("");
}

export interface ReportBody {
  months: string[];
  reachSeries: number[];
  engagementSeries: number[];
  stats: StatCell[];
  topPosts: RankItem[];
  followerPosts: RankItem[];
  linkClicksTotal: string;
  profileVisitsTotal: string;
  formatDistribution: FormatDistributionItem[];
  ideaBlocks: IdeaBlock[];
}

export function assembleReportData(
  client: { slug: string; name: string; niche: string | null; instagramHandle: string | null },
  report: { periodSlug: string; periodLabel: string; data: ReportBody }
): ReportData {
  return {
    clientSlug: client.slug,
    clientName: client.name,
    niche: client.niche ?? "",
    instagramHandle: client.instagramHandle ?? "",
    periodLabel: report.periodLabel,
    periodSlug: report.periodSlug,
    ...report.data,
  };
}

export function buildReportHTML(data: ReportData): string {
  const template = REPORT_TEMPLATE;

  return template
    .replaceAll("{{clientName}}", data.clientName)
    .replaceAll("{{niche}}", data.niche)
    .replaceAll("{{instagramHandle}}", data.instagramHandle)
    .replaceAll("{{periodLabel}}", data.periodLabel)
    .replaceAll("{{statCells}}", renderStatCells(data.stats))
    .replaceAll("{{topPostsList}}", renderRankList(data.topPosts))
    .replaceAll("{{followerPostsList}}", renderRankList(data.followerPosts))
    .replaceAll("{{linkClicksTotal}}", data.linkClicksTotal)
    .replaceAll("{{profileVisitsTotal}}", data.profileVisitsTotal)
    .replaceAll("{{formatPills}}", renderPills(data.formatDistribution))
    .replaceAll("{{ideaBlocks}}", renderIdeaBlocks(data.ideaBlocks))
    .replaceAll("{{monthsJSON}}", JSON.stringify(data.months))
    .replaceAll("{{reachSeriesJSON}}", JSON.stringify(data.reachSeries))
    .replaceAll("{{engagementSeriesJSON}}", JSON.stringify(data.engagementSeries));
}
