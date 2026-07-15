# Relatórios Timing

Gerador de páginas de relatório mensal (estilo do painel Lovable do Estúdio Timing),
sem depender de nenhuma plataforma. Cada relatório é um arquivo de dados (`.json`) que
vira uma página HTML independente, pronta para enviar ao cliente por link.

## Estrutura

```
relatorios-timing/
├── data/                  → um arquivo .json por relatório (cliente + período)
├── templates/report.html  → o design do relatório (edite aqui para mudar o visual)
├── generate.js            → lê /data e gera as páginas em /output
├── output/                → páginas HTML prontas (geradas automaticamente)
└── package.json
```

## Como gerar um novo relatório

1. Copie `data/joybeauty-2026-06.json` e renomeie (ex: `data/joybeauty-2026-07.json`).
2. Edite os campos com os números do mês (veja a lista abaixo).
3. Rode:
   ```bash
   npm run generate
   ```
4. A página aparece em `output/<clientSlug>/<periodSlug>/index.html`. Abra
   direto no navegador para conferir antes de publicar.

### Campos do arquivo de dados

- `clientSlug` — usado na URL (ex: `joybeauty` → `/joybeauty/2026-07`)
- `clientName`, `niche`, `instagramHandle`, `periodLabel`, `periodSlug`
- `months`, `reachSeries`, `engagementSeries` — dados dos 2 gráficos
- `stats` — os 8 números do período
- `topPosts`, `followerPosts` — rankings de conteúdo
- `linkClicksTotal`, `profileVisitsTotal`
- `formatDistribution` — pills de formato (Reels, Carrossel, etc.)
- `ideaBlocks` — os blocos de ideias/pautas do próximo mês

## Publicando o site (recomendado: Vercel)

1. Suba esta pasta para um repositório no GitHub (o Claude Code pode fazer isso por você).
2. Crie uma conta em [vercel.com](https://vercel.com) (gratuito) e importe o repositório.
3. Configure o "Output Directory" da Vercel como `output`.
4. A cada `npm run generate` + novo commit, o site atualiza sozinho.

(Netlify funciona da mesma forma, como alternativa.)

## Conectando o domínio estudiotiming.com.br

Você não precisa mudar o domínio de registrador. No painel do RegistroBR:

1. Decida o subdomínio, por exemplo `relatorios.estudiotiming.com.br`.
2. Na Vercel/Netlify, adicione esse domínio ao projeto — a plataforma vai te
   mostrar um endereço tipo `cname.vercel-dns.com`.
3. No RegistroBR, em "Zona DNS" do domínio, crie um registro:
   - Tipo: `CNAME`
   - Nome/Host: `relatorios`
   - Valor/Destino: o endereço que a Vercel/Netlify te deu
4. Aguarde a propagação (minutos a poucas horas) e acesse
   `relatorios.estudiotiming.com.br` para conferir.

## Próximos passos possíveis (com o Claude Code)

- Página inicial em `/` listando todos os clientes e períodos disponíveis
- Formulário simples para editar os dados sem mexer em JSON diretamente
- Autenticação por cliente (cada um só vê o próprio relatório)
- Trocar os arquivos `.json` por um banco de dados (ex: Supabase), permitindo
  editar os relatórios direto do navegador, sem rodar comandos
