"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoRelatorioPage({ params }: { params: { clientSlug: string } }) {
  const router = useRouter();
  const [periodLabel, setPeriodLabel] = useState("");
  const [periodSlug, setPeriodSlug] = useState("");
  const [csvFiles, setCsvFiles] = useState<FileList | null>(null);
  const [pdfFiles, setPdfFiles] = useState<FileList | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      setStatus("Criando rascunho...");
      const createRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientSlug: params.clientSlug, periodSlug, periodLabel }),
      });
      const createJson = await createRes.json();
      if (!createRes.ok) throw new Error(createJson.error || "Erro ao criar rascunho.");
      const reportId = createJson.report.id as string;

      if (csvFiles && csvFiles.length > 0) {
        setStatus("Lendo planilhas...");
        const formData = new FormData();
        Array.from(csvFiles).forEach((f) => formData.append("files", f));
        const csvRes = await fetch(`/api/reports/${reportId}/csv`, { method: "POST", body: formData });
        const csvJson = await csvRes.json();
        if (!csvRes.ok) throw new Error(csvJson.error || "Erro ao ler planilhas.");
      }

      if (pdfFiles && pdfFiles.length > 0) {
        const filesArray = Array.from(pdfFiles);
        for (let i = 0; i < filesArray.length; i++) {
          setStatus(`Lendo PDF ${i + 1} de ${filesArray.length}...`);
          const formData = new FormData();
          formData.append("file", filesArray[i]);
          const pdfRes = await fetch(`/api/reports/${reportId}/pdf`, { method: "POST", body: formData });
          const pdfJson = await pdfRes.json();
          if (!pdfRes.ok) throw new Error(pdfJson.error || `Erro ao ler o PDF "${filesArray[i].name}".`);
        }
      }

      router.push(`/projetos/${params.clientSlug}/${reportId}/revisar`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      setLoading(false);
      setStatus(null);
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <Link href={`/projetos/${params.clientSlug}`} style={{ fontSize: 13, color: "var(--muted)" }}>
        ← Voltar
      </Link>
      <h1 className="display-italic" style={{ fontSize: 32, margin: "16px 0 8px" }}>
        Gerar relatório.
      </h1>
      <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 28px" }}>
        Envie as planilhas (Alcance, Interações, Visualizações) e os PDFs do Meta Business Suite. Depois
        você revisa e completa os números antes de publicar.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="field">
          <label htmlFor="periodLabel">Período (texto exibido no relatório)</label>
          <input
            id="periodLabel"
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
            placeholder="01/07/2026 — 31/07/2026"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="periodSlug">Identificador do período (usado na URL)</label>
          <input
            id="periodSlug"
            value={periodSlug}
            onChange={(e) => setPeriodSlug(e.target.value)}
            placeholder="2026-07"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="csvFiles">Planilhas (.csv) — Alcance, Interações, Visualizações</label>
          <input id="csvFiles" type="file" accept=".csv" multiple onChange={(e) => setCsvFiles(e.target.files)} />
        </div>
        <div className="field">
          <label htmlFor="pdfFiles">PDFs do Meta Business Suite</label>
          <input id="pdfFiles" type="file" accept=".pdf" multiple onChange={(e) => setPdfFiles(e.target.files)} />
        </div>

        {error && <p className="error-text">{error}</p>}
        {status && !error && <p style={{ fontSize: 13, color: "var(--muted)" }}>{status}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Processando..." : "Gerar relatório"}
        </button>
      </form>
    </div>
  );
}
