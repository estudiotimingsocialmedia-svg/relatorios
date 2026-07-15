"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { ReportBody, RankItem, FormatDistributionItem } from "@/lib/report-html";

interface ClientInfo {
  slug: string;
  name: string;
  niche: string | null;
  instagramHandle: string | null;
}

interface ReportInfo {
  id: string;
  periodSlug: string;
  periodLabel: string;
  status: "draft" | "published";
  data: ReportBody;
}

function emptyRankItem(): RankItem {
  return { format: "", caption: "", statsLine: "", total: "" };
}

function emptyFormatItem(): FormatDistributionItem {
  return { label: "", count: 0 };
}

export default function ReportForm({ client, report }: { client: ClientInfo; report: ReportInfo }) {
  const router = useRouter();
  const [periodLabel, setPeriodLabel] = useState(report.periodLabel);
  const [data, setData] = useState<ReportBody>(report.data);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(updater: (draft: ReportBody) => ReportBody) {
    setData((prev) => updater(structuredClone(prev)));
  }

  async function refreshPreview() {
    setPreviewLoading(true);
    const res = await fetch("/api/reports/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client, periodSlug: report.periodSlug, periodLabel, data }),
    });
    const html = await res.text();
    setPreviewHtml(html);
    setPreviewLoading(false);
  }

  async function save(status: "draft" | "published") {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/reports/${report.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data, periodLabel, status }),
    });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(json.error || "Erro ao salvar.");
      return;
    }
    if (status === "published") {
      router.push(`/${client.slug}/${report.periodSlug}`);
    } else {
      router.push(`/projetos/${client.slug}`);
    }
  }

  return (
    <div>
      <Link href={`/projetos/${client.slug}`} style={{ fontSize: 13, color: "var(--muted)" }}>
        ← Voltar
      </Link>
      <h1 className="display-italic" style={{ fontSize: 32, margin: "16px 0 28px" }}>
        Revisar relatório — {client.name}.
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
              Período
            </p>
            <div className="field">
              <label htmlFor="periodLabel">Texto do período</label>
              <input id="periodLabel" value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} />
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
              Período em números
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {data.stats.map((stat, i) => (
                <div className="field" key={stat.label}>
                  <label>{stat.label}</label>
                  <input
                    value={stat.value}
                    onChange={(e) =>
                      update((d) => {
                        d.stats[i].value = e.target.value;
                        return d;
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
              Totais adicionais
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="field">
                <label>Cliques em link (total)</label>
                <input
                  value={data.linkClicksTotal}
                  onChange={(e) => update((d) => ({ ...d, linkClicksTotal: e.target.value }))}
                />
              </div>
              <div className="field">
                <label>Visitas ao perfil (total)</label>
                <input
                  value={data.profileVisitsTotal}
                  onChange={(e) => update((d) => ({ ...d, profileVisitsTotal: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <RankListEditor
            title="Melhores conteúdos"
            items={data.topPosts}
            onChange={(items) => update((d) => ({ ...d, topPosts: items }))}
          />

          <RankListEditor
            title="Conteúdos que trouxeram seguidores"
            items={data.followerPosts}
            onChange={(items) => update((d) => ({ ...d, followerPosts: items }))}
          />

          <FormatDistributionEditor
            items={data.formatDistribution}
            onChange={(items) => update((d) => ({ ...d, formatDistribution: items }))}
          />

          {data.ideaBlocks.map((block, blockIndex) => (
            <div className="card" style={{ padding: 20 }} key={block.label}>
              <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
                {block.label}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {block.cards.map((card, cardIndex) => (
                  <div key={cardIndex} className="card" style={{ padding: 14, background: "var(--bg)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        placeholder="Título"
                        value={card.title}
                        onChange={(e) =>
                          update((d) => {
                            d.ideaBlocks[blockIndex].cards[cardIndex].title = e.target.value;
                            return d;
                          })
                        }
                      />
                      <input
                        placeholder="Tag (opcional, ex: Reels)"
                        value={card.tag ?? ""}
                        onChange={(e) =>
                          update((d) => {
                            d.ideaBlocks[blockIndex].cards[cardIndex].tag = e.target.value;
                            return d;
                          })
                        }
                      />
                      <textarea
                        placeholder="Descrição"
                        rows={2}
                        value={card.desc}
                        onChange={(e) =>
                          update((d) => {
                            d.ideaBlocks[blockIndex].cards[cardIndex].desc = e.target.value;
                            return d;
                          })
                        }
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() =>
                          update((d) => {
                            d.ideaBlocks[blockIndex].cards.splice(cardIndex, 1);
                            return d;
                          })
                        }
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn"
                  onClick={() =>
                    update((d) => {
                      d.ideaBlocks[blockIndex].cards.push({ title: "", tag: "", desc: "" });
                      return d;
                    })
                  }
                >
                  + Adicionar card
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <button type="button" className="btn" onClick={refreshPreview} disabled={previewLoading} style={{ width: "100%" }}>
              {previewLoading ? "Atualizando..." : "Atualizar prévia"}
            </button>
          </div>
          <div className="card" style={{ overflow: "hidden", height: 640 }}>
            {previewHtml ? (
              <iframe srcDoc={previewHtml} style={{ width: "100%", height: "100%", border: "none" }} title="Prévia do relatório" />
            ) : (
              <div style={{ padding: 20, color: "var(--muted)", fontSize: 13 }}>
                Clique em "Atualizar prévia" para ver como o relatório vai ficar.
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="error-text" style={{ marginTop: 20 }}>{error}</p>}

      <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
        <button type="button" className="btn" onClick={() => save("draft")} disabled={saving}>
          Salvar rascunho
        </button>
        <button type="button" className="btn btn-primary" onClick={() => save("published")} disabled={saving}>
          Publicar relatório
        </button>
      </div>
    </div>
  );
}

function RankListEditor({
  title,
  items,
  onChange,
}: {
  title: string;
  items: RankItem[];
  onChange: (items: RankItem[]) => void;
}) {
  function updateItem(index: number, field: keyof RankItem, value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(next);
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
        {title}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} className="card" style={{ padding: 14, background: "var(--bg)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input placeholder="Formato (ex: Reels)" value={item.format} onChange={(e) => updateItem(i, "format", e.target.value)} />
              <input placeholder="Legenda / descrição" value={item.caption} onChange={(e) => updateItem(i, "caption", e.target.value)} />
              <input
                placeholder="Linha de estatísticas (ex: 612 curtidas · 48 comentários)"
                value={item.statsLine}
                onChange={(e) => updateItem(i, "statsLine", e.target.value)}
              />
              <input placeholder="Total (ex: 812)" value={item.total} onChange={(e) => updateItem(i, "total", e.target.value)} />
              <button type="button" className="btn" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                Remover
              </button>
            </div>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => onChange([...items, emptyRankItem()])}>
          + Adicionar item
        </button>
      </div>
    </div>
  );
}

function FormatDistributionEditor({
  items,
  onChange,
}: {
  items: FormatDistributionItem[];
  onChange: (items: FormatDistributionItem[]) => void;
}) {
  function updateLabel(index: number, value: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, label: value } : item)));
  }

  function updateCount(index: number, value: string) {
    const count = Number(value) || 0;
    onChange(items.map((item, i) => (i === index ? { ...item, count } : item)));
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 12px" }}>
        Distribuição por formato
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input placeholder="Formato (ex: Reels)" value={item.label} onChange={(e) => updateLabel(i, e.target.value)} style={{ flex: 1 }} />
            <input
              placeholder="Qtd."
              type="number"
              value={item.count}
              onChange={(e) => updateCount(i, e.target.value)}
              style={{ width: 80 }}
            />
            <button type="button" className="btn" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              Remover
            </button>
          </div>
        ))}
        <button type="button" className="btn" onClick={() => onChange([...items, emptyFormatItem()])}>
          + Adicionar formato
        </button>
      </div>
    </div>
  );
}
