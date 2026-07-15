// generate.js
// Lê cada arquivo em /data e gera uma página de relatório em /output/<clientSlug>/<periodSlug>/index.html
//
// Uso:
//   node generate.js
//
// Para adicionar um novo relatório: copie um arquivo de /data, ajuste os campos,
// e rode o comando de novo. Nada mais precisa ser tocado.

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
const OUTPUT_DIR = join(__dirname, "output");

function renderStatCells(stats) {
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

function renderRankList(items) {
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

function renderPills(items) {
  return items
    .map((i) => `<span class="pill">${i.label}<b>${i.count}</b></span>`)
    .join("");
}

function renderIdeaBlocks(blocks) {
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

function buildReportHTML(data) {
  const template = readFileSync(join(__dirname, "templates", "report.html"), "utf8");

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

function run() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.log("Nenhum arquivo de dados encontrado em /data.");
    return;
  }

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"));
    const html = buildReportHTML(data);

    const outDir = join(OUTPUT_DIR, data.clientSlug, data.periodSlug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), html);

    console.log(`Gerado: output/${data.clientSlug}/${data.periodSlug}/index.html`);
  }
}

run();
