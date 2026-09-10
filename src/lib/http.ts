import { NextResponse } from "next/server";
import { AppError, SafeMessages } from "./error";
import { logger } from "./logger";

/** Boundary mapper L1 untuk Route Handlers — satu-satunya try/catch HTTP. */
export function toErrorResponse(err: unknown, ctx: { module: string; requestId?: string; route?: string }) {
  const appErr = err instanceof AppError ? err : new AppError("INTERNAL", SafeMessages.internal, { cause: err });
  if (appErr.code === "INTERNAL" || appErr.code === "UPSTREAM_ERROR") {
    logger.error(appErr.message, {
      module: ctx.module,
      requestId: ctx.requestId,
      route: ctx.route,
      errorCode: appErr.code,
    });
  }
  return NextResponse.json(appErr.toJSON(), { status: appErr.httpStatus });
}

export function ok<T>(data: T, init?: { status?: number }) {
  return NextResponse.json({ ok: true, data }, { status: init?.status ?? 200 });
}

export function requestIdFromHeaders(headers: Headers): string | undefined {
  return headers.get("x-request-id") ?? undefined;
}
