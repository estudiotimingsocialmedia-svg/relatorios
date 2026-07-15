import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export interface PdfExtractionResult {
  totalViews: number | null;
  totalReach: number | null;
  totalInteractions: number | null;
  viewsChangePct: number | null;
  reachChangePct: number | null;
  interactionsChangePct: number | null;
  periodLabel: string | null;
}

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    totalViews: { type: ["number", "null"] },
    totalReach: { type: ["number", "null"] },
    totalInteractions: { type: ["number", "null"] },
    viewsChangePct: { type: ["number", "null"] },
    reachChangePct: { type: ["number", "null"] },
    interactionsChangePct: { type: ["number", "null"] },
    periodLabel: { type: ["string", "null"] },
  },
  required: [
    "totalViews",
    "totalReach",
    "totalInteractions",
    "viewsChangePct",
    "reachChangePct",
    "interactionsChangePct",
    "periodLabel",
  ],
  additionalProperties: false,
};

const EXTRACTION_PROMPT =
  "Este PDF é uma captura de tela do painel 'Insights' do Meta Business Suite (Instagram). " +
  "Extraia os números TOTAIS do período mostrado (visualizações, alcance, interações com o conteúdo), " +
  "as variações percentuais indicadas ao lado de cada número (podem ser positivas ou negativas), " +
  "e o texto do período exibido no topo (ex: '17 de jun a 14 de jul'). " +
  "Se algum valor não estiver visível ou legível, use null nesse campo.";

export async function extractMetaBusinessSuitePdf(pdfBuffer: Buffer): Promise<PdfExtractionResult> {
  const base64 = pdfBuffer.toString("base64");

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
    },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: base64 },
          },
          { type: "text", text: EXTRACTION_PROMPT },
        ],
      },
    ],
  });

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );

  if (!textBlock) {
    throw new Error("A IA não retornou texto na extração do PDF.");
  }

  return JSON.parse(textBlock.text) as PdfExtractionResult;
}
