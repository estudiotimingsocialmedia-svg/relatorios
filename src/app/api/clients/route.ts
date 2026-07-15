import { NextRequest, NextResponse } from "next/server";
import { createClient, isReservedSlug } from "@/db/queries";

export const runtime = "nodejs";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Nome do cliente é obrigatório." }, { status: 400 });
  }

  const slug = typeof body?.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name);

  if (!slug) {
    return NextResponse.json({ error: "Não foi possível gerar um identificador válido a partir do nome." }, { status: 400 });
  }

  if (isReservedSlug(slug)) {
    return NextResponse.json({ error: `"${slug}" é um identificador reservado. Escolha outro.` }, { status: 400 });
  }

  try {
    const client = await createClient({
      slug,
      name,
      niche: body?.niche,
      instagramHandle: body?.instagramHandle,
      objective: body?.objective,
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json({ error: `Já existe um cliente com o identificador "${slug}".` }, { status: 409 });
    }
    return NextResponse.json({ error: "Erro ao criar cliente." }, { status: 500 });
  }
}
