/**
 * @file proxy.ts
 * @description The console's gate (Next.js 16 `proxy`, ex-middleware): a page asked for without an operator session
 * is sent to `/login`, with the page to come back to. The backend stays the real gate — every call is authorised by
 * the identity service's token, and `authorize` refuses a non-admin — but without this, a visitor saw the console's
 * screens with every figure a 401 (krizaka/orazaka-web-admin#5).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/core/auth/session-cookie";
import { readAuthFlags } from "@/core/config/auth-flags";
import { gate } from "@/core/config/gate";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE) || request.cookies.has(`__Secure-${SESSION_COOKIE}`);
  // The decision is pure (core/config/gate.ts): a closed site (AUTH_LOGIN_ENABLED false) answers 404 on the BFF routes.
  const decision = gate(pathname, hasSession, readAuthFlags());
  if (decision === "not-found") {
    return NextResponse.json({ error: "Orazaka Operations is in development — sign-in is closed on this site" }, { status: 404 });
  }
  if (decision === "pass") return NextResponse.next();
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  /** Pages and BFF routes (a closed site answers 404 there); Next.js internals and static files pass. */
  matcher: ["/((?!_next/static|_next/image|_next/data|favicon|robots.txt).*)"],
};
