import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const PUBLIC_PATH_PREFIXES = ["/login", "/api/auth/login"];

// Rotas internas: raiz, painel de projetos e qualquer chamada de API que não
// seja o próprio login. Qualquer outro caminho de 2 segmentos (ex:
// /joybeauty/2026-06) é a página pública de um relatório e fica liberado.
function isInternalPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/projetos")) return true;
  if (pathname.startsWith("/api/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (!isInternalPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);

  if (!valid) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
