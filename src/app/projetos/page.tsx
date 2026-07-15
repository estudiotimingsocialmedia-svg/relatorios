import Link from "next/link";
import { listClientsWithReportCounts } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const clientList = await listClientsWithReportCounts();

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--muted)",
              margin: "0 0 8px",
            }}
          >
            Estúdio Timing
          </p>
          <h1 className="display-italic" style={{ fontSize: 40, margin: 0 }}>
            Projetos.
          </h1>
        </div>
        <Link href="/projetos/novo" className="btn btn-primary">
          + Novo cliente
        </Link>
      </div>

      {clientList.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>Nenhum cliente cadastrado ainda.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {clientList.map((client) => (
            <Link
              key={client.id}
              href={`/projetos/${client.slug}`}
              className="card"
              style={{ padding: 24, textDecoration: "none", color: "inherit", display: "block" }}
            >
              <h2 className="display-italic" style={{ fontSize: 24, margin: "0 0 6px" }}>
                {client.name}
              </h2>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "0 0 16px" }}>
                {client.niche || "Sem nicho definido"}
                {client.instagramHandle ? ` · @${client.instagramHandle}` : ""}
              </p>
              {client.objective && (
                <p style={{ fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>{client.objective}</p>
              )}
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "var(--muted)" }}>
                <span>{client.publishedCount} publicado(s)</span>
                <span>{client.draftCount} rascunho(s)</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
