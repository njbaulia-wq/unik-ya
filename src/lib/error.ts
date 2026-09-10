/**
 * L4 shared kernel — satu-satunya pola error di seluruh codebase.
 * Service melempar/mengembalikan AppError. Boundary L1 (lib/http.ts,
 * lib/action.ts) memetakan ke response. Dilarang throw Error mentah,
 * throw string, atau meneruskan error DB/ORM mentah ke client.
 */

export const APP_ERROR_CODES = [
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "VALIDATION_ERROR",
  "CONFLICT",
  "RATE_LIMITED",
  "UPSTREAM_ERROR",
  "INTERNAL",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

const HTTP_STATUS: Record<AppErrorCode, number> = {
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL: 500,
};

export interface FieldError {
  field: string;
  message: string;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly details?: FieldError[];
  /** Internal saja — tidak pernah diserialisasi ke client. */
  readonly cause?: unknown;

  constructor(
    code: AppErrorCode,
    message: string,
    opts?: { details?: FieldError[]; cause?: unknown },
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = HTTP_STATUS[code];
    this.details = opts?.details;
    this.cause = opts?.cause;
  }

  /** Envelope aman untuk client — tanpa cause/stack/SQL/nama kolom. */
  toJSON(): { ok: false; error: { code: AppErrorCode; message: string; details?: FieldError[] } } {
    return {
      ok: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    };
  }
}

// Pesan aman berbahasa Indonesia (PRD §57 — jelas, tanpa "Oops!!!").
export const SafeMessages = {
  notFoundProduct: "Produk belum ditemukan. Produk mungkin telah dihapus atau belum dipublikasikan.",
  notFoundDeveloper: "Developer belum ditemukan.",
  notFoundCategory: "Kategori belum ditemukan.",
  unauthorized: "Anda perlu masuk untuk mengakses halaman ini.",
  forbidden: "Anda tidak memiliki akses untuk tindakan ini.",
  validation: "Ada isian yang belum valid. Periksa kembali formulir.",
  conflict: "Data bertentangan dengan data yang sudah ada.",
  rateLimited: "Terlalu sering. Coba lagi sebentar.",
  upstream: "Layanan data sedang bermasalah. Coba lagi sebentar.",
  internal: "Terjadi kesalahan. Coba lagi.",
} as const;

export function notFound(message: string = SafeMessages.notFoundProduct, cause?: unknown): AppError {
  return new AppError("NOT_FOUND", message, { cause });
}

export function forbidden(message: string = SafeMessages.forbidden, cause?: unknown): AppError {
  return new AppError("FORBIDDEN", message, { cause });
}

export function unauthorized(message: string = SafeMessages.unauthorized, cause?: unknown): AppError {
  return new AppError("UNAUTHORIZED", message, { cause });
}

export function validationError(details: FieldError[], cause?: unknown): AppError {
  return new AppError("VALIDATION_ERROR", SafeMessages.validation, { details, cause });
}

export function conflict(message: string = SafeMessages.conflict, cause?: unknown): AppError {
  return new AppError("CONFLICT", message, { cause });
}

export function rateLimited(message: string = SafeMessages.rateLimited): AppError {
  return new AppError("RATE_LIMITED", message);
}

/** Bungkus error tak dikenal (DB/ORM/dll) jadi INTERNAL generik. */
export function toAppError(err: unknown, fallback = SafeMessages.internal): AppError {
  if (err instanceof AppError) return err;
  return new AppError("INTERNAL", fallback, { cause: err });
}
