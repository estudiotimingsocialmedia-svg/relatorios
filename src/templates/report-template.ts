// Embutido como string (em vez de lido do disco em runtime) para não depender
// do file tracing do Next.js incluir o .html no bundle serverless da Vercel.
export const REPORT_TEMPLATE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{clientName}} — Relatório · Estúdio Timing</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #F6F1E7;
    --bg-cream-dark: #EDE4D2;
    --card: #FFFDF8;
    --border: #E3DBC7;
    --copper: #A85D2B;
    --foreground: #2B2620;
    --muted: #8A877E;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--bg);
    color: var(--foreground);
    font-family: 'Inter', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .display-italic {
    font-family: 'Fraunces', serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.01em;
  }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  header.top { border-bottom: 1px solid var(--border); }
  header.top .wrap { padding: 56px 24px; }
  .section-tag {
    font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted); margin: 0 0 20px;
  }
  .head-row { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: flex-end; gap: 20px; }
  h1.client-name { font-size: 56px; margin: 0; line-height: 1; }
  .client-meta { margin: 14px 0 0; font-size: 14px; color: var(--muted); }
  .badge {
    display: inline-block; border: 1px solid var(--border); background: rgba(237,228,210,0.5);
    border-radius: 999px; padding: 6px 14px; font-size: 12px;
  }
  section { border-top: 1px solid var(--border); }
  section .wrap { padding: 56px 24px; }
  .sec-head { display: flex; align-items: baseline; gap: 20px; margin-bottom: 36px; }
  .sec-num { font-size: 14px; color: var(--copper); white-space: nowrap; }
  h2.sec-title { font-size: 34px; margin: 0; line-height: 1.15; }
  .sec-sub { margin: 8px 0 0; font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); }

  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
  .chart-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }
  .chart-label { font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin: 0 0 16px; }
  .chart-wrap { position: relative; height: 200px; }

  .stat-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
    background: var(--border); border: 1px solid var(--border); border-radius: 14px; overflow: hidden;
  }
  .stat-cell { background: var(--bg); padding: 24px; }
  .stat-label { font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 0 0 8px; }
  .stat-value { font-size: 32px; margin: 0; }

  ol.rank-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
  .rank-item {
    display: flex; align-items: center; gap: 16px; background: var(--card);
    border: 1px solid var(--border); border-radius: 12px; padding: 16px;
  }
  .rank-num { font-size: 26px; color: var(--copper); width: 36px; flex-shrink: 0; }
  .rank-thumb { width: 56px; height: 56px; border-radius: 8px; background: var(--bg-cream-dark); flex-shrink: 0; }
  .rank-body { flex: 1; min-width: 0; }
  .rank-format { font-size: 10px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin: 0 0 4px; }
  .rank-caption { font-size: 14px; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rank-stats { display: flex; gap: 14px; margin-top: 8px; font-size: 12px; color: var(--muted); }
  .rank-right { text-align: right; flex-shrink: 0; }
  .rank-total { font-size: 20px; color: var(--copper); margin: 0; }

  .big-number { font-size: 72px; line-height: 1; margin: 0; }
  .big-number .dot { color: var(--copper); }
  .big-number-caption { font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin: 12px 0 0; }

  .pill-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .pill { border: 1px solid var(--border); background: rgba(237,228,210,0.4); border-radius: 999px; padding: 8px 16px; font-size: 14px; }
  .pill b { color: var(--copper); font-weight: 600; margin-left: 6px; }

  .idea-block + .idea-block { margin-top: 40px; }
  .idea-label { font-size: 11px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); margin: 0 0 16px; }
  .idea-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .idea-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .idea-title { font-size: 19px; margin: 0; }
  .idea-tag { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--copper); margin: 6px 0 0; }
  .idea-desc { font-size: 14px; color: var(--muted); margin: 10px 0 0; line-height: 1.6; }

  footer { border-top: 1px solid var(--border); margin-top: 40px; }
  footer .wrap { padding: 36px 24px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; }
  .foot-note { font-size: 12px; color: var(--muted); }
  .foot-brand { font-size: 17px; }

  @media (max-width: 720px) {
    h1.client-name { font-size: 38px; }
    h2.sec-title { font-size: 26px; }
    .charts-grid, .stat-grid, .idea-grid { grid-template-columns: 1fr; }
    .big-number { font-size: 48px; }
  }
</style>
</head>
<body>

<header class="top">
  <div class="wrap">
    <p class="section-tag">Relatório · Estúdio Timing</p>
    <div class="head-row">
      <div>
        <h1 class="client-name display-italic">{{clientName}}<span style="color:var(--copper)">.</span></h1>
        <p class="client-meta">{{periodLabel}} · Nicho: {{niche}}</p>
      </div>
      <span class="badge">Instagram — {{instagramHandle}}</span>
    </div>
  </div>
</header>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">02 /</span>
      <div>
        <h2 class="sec-title display-italic">Últimos 6 meses<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">visão macro</p>
      </div>
    </div>
    <div class="charts-grid">
      <div class="chart-card">
        <p class="chart-label">Alcance mensal</p>
        <div class="chart-wrap"><canvas id="reachChart" role="img" aria-label="Alcance mensal">Gráfico de alcance mensal.</canvas></div>
      </div>
      <div class="chart-card">
        <p class="chart-label">Engajamento mensal</p>
        <div class="chart-wrap"><canvas id="engChart" role="img" aria-label="Engajamento mensal">Gráfico de engajamento mensal.</canvas></div>
      </div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">03 /</span>
      <div>
        <h2 class="sec-title display-italic">Período em números<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">mês avaliado</p>
      </div>
    </div>
    <div class="stat-grid">
      {{statCells}}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">04 /</span>
      <div>
        <h2 class="sec-title display-italic">Melhores conteúdos<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">por engajamento — curtidas + comentários + shares + saves</p>
      </div>
    </div>
    <ol class="rank-list">
      {{topPostsList}}
    </ol>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">05 /</span>
      <div>
        <h2 class="sec-title display-italic">Conteúdos que trouxeram seguidores<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">ordenados por seguidores ganhos</p>
      </div>
    </div>
    <ol class="rank-list">
      {{followerPostsList}}
    </ol>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">06 /</span>
      <div>
        <h2 class="sec-title display-italic">Cliques totais em links<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">link da bio + links no perfil</p>
      </div>
    </div>
    <p class="big-number display-italic">{{linkClicksTotal}}<span class="dot">.</span></p>
    <p class="big-number-caption">Total no período</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">07 /</span>
      <div>
        <h2 class="sec-title display-italic">Visitas ao perfil<span style="color:var(--copper)">.</span></h2>
      </div>
    </div>
    <p class="big-number display-italic">{{profileVisitsTotal}}<span class="dot">.</span></p>
    <p class="big-number-caption">Total no período</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">08 /</span>
      <div>
        <h2 class="sec-title display-italic">Distribuição por formato<span style="color:var(--copper)">.</span></h2>
      </div>
    </div>
    <div class="pill-row">
      {{formatPills}}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head">
      <span class="sec-num">09 /</span>
      <div>
        <h2 class="sec-title display-italic">Ideias para o próximo mês<span style="color:var(--copper)">.</span></h2>
        <p class="sec-sub">pautas, temas em alta e oportunidades comerciais</p>
      </div>
    </div>
    {{ideaBlocks}}
  </div>
</section>

<footer>
  <div class="wrap">
    <span class="foot-note">© Estúdio Timing — Relatório gerado automaticamente</span>
    <span class="foot-brand display-italic">Timing.</span>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
<script>
(function() {
  var months = {{monthsJSON}};
  var reachSeries = {{reachSeriesJSON}};
  var engagementSeries = {{engagementSeriesJSON}};
  var gridColor = '#E6E2D6';
  var tickColor = '#8A877E';
  var copper = '#A85D2B';

  function baseOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { color: tickColor, font: { size: 11 } } }
      }
    };
  }

  function lineDataset(data) {
    return {
      labels: months,
      datasets: [{
        data: data,
        borderColor: copper,
        backgroundColor: 'rgba(168,93,43,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointBackgroundColor: copper
      }]
    };
  }

  new Chart(document.getElementById('reachChart'), { type: 'line', data: lineDataset(reachSeries), options: baseOptions() });
  new Chart(document.getElementById('engChart'), { type: 'line', data: lineDataset(engagementSeries), options: baseOptions() });
})();
</script>

</body>
</html>
`;
