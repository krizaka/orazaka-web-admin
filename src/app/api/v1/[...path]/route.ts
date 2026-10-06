/**
 * @file route.ts
 * @description Catch-all BFF proxy for the SecOps console.
 *
 * Same contract as the web client's: the browser never reaches a backend port
 * directly (AGENTS.md §8). The session JWT is injected server-side and the
 * request is forwarded to the edge, whose route table sends /api/v1/billing/**
 * to the billing service.
 *
 * The console only ever calls /api/v1/**. Billing's hold/settle endpoints live
 * under /internal/v1 and are not in the edge's route table at all, so they are
 * unreachable from here by construction rather than by discipline.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/core/auth/auth-options";

async function proxyRequest(req: Request, segments: string[], method: string) {
  const edgeUrl = process.env.ROUTER_URL || "http://localhost:8088";

  try {
    const session = await getServerSession(authOptions);
    const token = session?.user?.token;
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: no active admin session" },
        { status: 401 },
      );
    }

    const { search } = new URL(req.url);
    const targetUrl = `${edgeUrl}/api/v1/${segments.join("/")}${search}`;

    let body: BodyInit | undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      body = await req.text();
    }

    const response = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return NextResponse.json(await response.json(), { status: response.status });
    }
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": contentType || "text/plain" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "BFF proxy error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, (await params).path, "GET");
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, (await params).path, "POST");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, (await params).path, "PUT");
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(req, (await params).path, "DELETE");
}
