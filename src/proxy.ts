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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/login") return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE) || request.cookies.has(`__Secure-${SESSION_COOKIE}`)) return NextResponse.next();
  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("callbackUrl", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  /** Pages only: the BFF (`/api/**`) answers 401 itself, Next.js internals and static files pass. */
  matcher: ["/((?!api/|_next/static|_next/image|_next/data|favicon).*)"],
};
