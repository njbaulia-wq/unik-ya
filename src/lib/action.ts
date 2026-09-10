import { AppError, SafeMessages } from "./error";
import { logger } from "./logger";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: { field: string; message: string }[] } };

/** Boundary mapper L1 untuk Server Actions — satu-satunya try/catch action. */
export async function runAction<T>(
  fn: () => Promise<T>,
  ctx: { module: string; action: string; requestId?: string; userId?: string },
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (err) {
    const appErr = err instanceof AppError ? err : new AppError("INTERNAL", SafeMessages.internal, { cause: err });
    if (appErr.code === "INTERNAL" || appErr.code === "UPSTREAM_ERROR") {
      logger.error(appErr.message, {
        module: ctx.module,
        action: ctx.action,
        requestId: ctx.requestId,
        userId: ctx.userId,
        errorCode: appErr.code,
      });
    }
    return { ok: false, error: appErr.toJSON().error };
  }
}
