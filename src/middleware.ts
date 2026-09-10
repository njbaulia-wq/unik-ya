import { NextRequest, NextResponse } from "next/server";

/** Suntik/propagasi x-request-id untuk setiap request (ARCHITECTURE.md §3.4). */
export function middleware(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id") ??
    (globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
