# Relatórios Timing

Portal interno do Estúdio Timing: login por senha única, painel de clientes e
geração de relatórios de redes sociais a partir de upload de planilhas/PDFs do
Meta Business Suite. Cada relatório publicado vira uma página HTML pública,
pronta para enviar ao cliente por link — sem exigir login.

## Arquitetura

Aplicação Next.js (App Router) hospedada na Vercel, com Postgres (Vercel
Postgres/Neon) guardando clientes e relatórios.

```
relatorios-timing/
├── middleware.ts              → protege as rotas internas (tudo exceto /clientSlug/periodoSlug)
├── src/
│   ├── app/
│   │   ├── login/                          → tela de login (senha única)
│   │   ├── projetos/                       → painel interno (protegido)
│   │   │   ├── page.tsx                    → lista de clientes
│   │   │   ├── novo/                       → criar cliente
│   │   │   └── [clientSlug]/
│   │   │       ├── page.tsx                → detalhe do cliente + relatórios
│   │   │       ├── novo-relatorio/         → upload de planilhas/PDFs
│   │   │       └── [reportId]/revisar/     → tela de revisão com prévia ao vivo
│   │   ├── [clientSlug]/[periodSlug]/      → página PÚBLICA do relatório final
│   │   └── api/
│   │       ├── auth/login, auth/logout
│   │       ├── clients/                    → criar cliente
│   │       └── reports/                    → criar rascunho, upload csv/pdf, revisar, publicar
│   ├── db/                                 → schema Drizzle (clients, reports) + queries
│   ├── lib/
│   │   ├── report-html.ts                  → gera o HTML do relatório (mesmo visual de sempre)
│   │   ├── parse-csv.ts                    → lê os CSVs do Meta Business Suite (UTF-16LE)
│   │   ├── extract-pdf.ts                  → lê os PDFs via API da Anthropic (Claude)
│   │   ├── auth.ts / session.ts            → senha e sessão (cookie assinado)
│   └── templates/report-template.ts        → o design do relatório (edite aqui para mudar o visual)
├── data/, generate.js, output/             → gerador estático antigo, mantido como referência/rollback
└── scripts/
    ├── run-migrations.ts                   → cria as tabelas no Postgres
    └── migrate-existing-data.ts            → importa data/*.json (formato antigo) para o banco
```

## Fluxo de um relatório novo

1. Entre em `/` com a senha do Estúdio.
2. Em **Projetos**, abra o cliente (ou crie um novo em "+ Novo cliente").
3. Clique em **"+ Gerar novo relatório"**, informe o período (o identificador
   de período deve ser `AAAA-MM`, ex: `2026-07`, para bater com os meses das
   planilhas) e envie:
   - As planilhas `.csv` exportadas do Meta Business Suite (Alcance,
     Interações, Visualizações) — lidas automaticamente.
   - Os PDFs do Meta Business Suite (resumo do painel) — lidos via IA
     (Claude), preenchendo os totais do período quando visíveis no PDF.
4. Você cai na tela de **revisão**: os campos que não têm fonte automática
   (posts em destaque, cliques em link, visitas ao perfil, seguidores
   ganhos, distribuição por formato, ideias do próximo mês) ficam para
   preencher à mão. Clique em "Atualizar prévia" para ver o resultado exato.
5. **Salvar rascunho** guarda o progresso sem publicar. **Publicar relatório**
   deixa a página no ar em `/clientSlug/periodoSlug`, pública, sem login.

## Configuração local (requer Node.js instalado)

```bash
npm install
npm run dev
```

Variáveis de ambiente necessárias (`.env.local`):

```
INTERNAL_PASSWORD=senha-da-equipe
SESSION_SECRET=uma-string-aleatoria-longa
ANTHROPIC_API_KEY=sk-ant-...
POSTGRES_URL=...   # injetada automaticamente ao conectar Vercel Postgres/Neon
```

Depois de configurar o banco:

```bash
npm run db:migrate            # cria as tabelas (clients, reports)
npm run migrate-existing-data # importa data/joybeauty-2026-06.json existente
```

**Sem Node.js instalado?** As mesmas duas ações existem como rotas protegidas
por login — depois de configurar o banco na Vercel (veja abaixo), faça login
no site e visite, uma vez cada:

- `/api/admin/migrate` — cria as tabelas
- `/api/admin/seed` — importa `data/joybeauty-2026-06.json`

Ambas são seguras de visitar mais de uma vez (não duplicam dados).

## Publicando na Vercel

1. Conecte o repositório na Vercel (Framework Preset: **Next.js**, detectado
   automaticamente — remova qualquer Build Command/Output Directory
   customizado que tenha ficado do gerador estático antigo).
2. Na aba **Storage**, conecte um banco **Postgres** (Neon) ao projeto — isso
   injeta `POSTGRES_URL` e variáveis relacionadas automaticamente.
3. Em **Settings → Environment Variables**, adicione `INTERNAL_PASSWORD`,
   `SESSION_SECRET` e `ANTHROPIC_API_KEY`.
4. Rode as migrations e a importação dos dados existentes (uma vez, com
   `POSTGRES_URL` apontando para o banco de produção).
5. Domínio `relatorios.estudiotiming.com.br` continua igual — não precisa
   mexer no DNS.

## Próximos passos possíveis

- Página inicial listando todos os clientes/períodos publicados
- Contas individuais em vez de senha única
- Fonte automática para cliques em link, visitas ao perfil e seguidores
  ganhos (hoje ficam manuais, pois os exports enviados não trazem esses
  números)
