"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NovoClientePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [objective, setObjective] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, niche, instagramHandle, objective }),
    });

    const json = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(json.error || "Erro ao criar cliente.");
      return;
    }

    router.push(`/projetos/${json.client.slug}`);
  }

  return (
    <div style={{ maxWidth: 480 }}>
      <Link href="/projetos" style={{ fontSize: 13, color: "var(--muted)" }}>
        ← Voltar
      </Link>
      <h1 className="display-italic" style={{ fontSize: 32, margin: "16px 0 28px" }}>
        Novo cliente.
      </h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="field">
          <label htmlFor="name">Nome do cliente</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="niche">Nicho</label>
          <input id="niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Ex: Salão de Beleza" />
        </div>
        <div className="field">
          <label htmlFor="instagramHandle">Instagram (sem @)</label>
          <input id="instagramHandle" value={instagramHandle} onChange={(e) => setInstagramHandle(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="objective">Objetivo</label>
          <textarea
            id="objective"
            rows={3}
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="O que esse cliente está buscando com o trabalho de social media"
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Criando..." : "Criar cliente"}
        </button>
      </form>
    </div>
  );
}
