import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientBySlug, listReportsForClient } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function ClientePage({ params }: { params: { clientSlug: string } }) {
  const client = await getClientBySlug(params.clientSlug);
  if (!client) notFound();

  const clientReports = await listReportsForClient(client.id);

  return (
    <div>
      <Link href="/projetos" style={{ fontSize: 13, color: "var(--muted)" }}>
        ← Voltar
      </Link>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          margin: "16px 0 32px",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="display-italic" style={{ fontSize: 40, margin: "0 0 6px" }}>
            {client.name}.
          </h1>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            {client.niche || "Sem nicho definido"}
            {client.instagramHandle ? ` · @${client.instagramHandle}` : ""}
          </p>
        </div>
        <Link href={`/projetos/${client.slug}/novo-relatorio`} className="btn btn-primary">
          + Gerar novo relatório
        </Link>
      </div>

      {client.objective && (
        <div className="card" style={{ padding: 20, marginBottom: 32 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.07em", textTransform: "uppercase", color: "var(--muted)", margin: "0 0 8px" }}>
            Objetivo
          </p>
          <p style={{ margin: 0, lineHeight: 1.6 }}>{client.objective}</p>
        </div>
      )}

      <h2 className="display-italic" style={{ fontSize: 22, margin: "0 0 16px" }}>
        Relatórios.
      </h2>

      {clientReports.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Nenhum relatório gerado ainda.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {clientReports.map((report) => (
            <Link
              key={report.id}
              href={
                report.status === "published"
                  ? `/${client.slug}/${report.periodSlug}`
                  : `/projetos/${client.slug}/${report.id}/revisar`
              }
              className="card"
              style={{
                padding: 18,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{report.periodLabel}</span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: report.status === "published" ? "var(--copper)" : "var(--muted)",
                }}
              >
                {report.status === "published" ? "Publicado" : "Rascunho"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
