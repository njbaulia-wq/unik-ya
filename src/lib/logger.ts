/**
 * L4 shared kernel — satu-satunya logger. Dilarang console.log lepas
 * di kode produksi. Format: JSON satu baris di prod, pretty di dev.
 * Field wajib: timestamp, level, module, request-id, message.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  module: string;
  requestId?: string;
  userId?: string;
  route?: string;
  action?: string;
  durationMs?: number;
  errorCode?: string;
  [key: string]: unknown;
}

function baseEntry(level: LogLevel, message: string, fields: LogFields): Record<string, unknown> {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
}

function emit(level: LogLevel, message: string, fields: LogFields): void {
  const entry = baseEntry(level, message, fields);
  if (process.env.NODE_ENV === "production") {
    // JSON satu baris agar bisa di-ingest log aggregator.
    const line = JSON.stringify(entry);
    if (level === "error" || level === "warn") process.stderr.write(line + "\n");
    else process.stdout.write(line + "\n");
  } else {
    // Dev: ringkas agar terbaca manusia.
    const rid = fields.requestId ? ` [rid=${fields.requestId}]` : "";
    process.stdout.write(`[${level}] [${fields.module}]${rid} ${message}\n`);
  }
}

export const logger = {
  debug: (message: string, fields: LogFields) => emit("debug", message, fields),
  info: (message: string, fields: LogFields) => emit("info", message, fields),
  warn: (message: string, fields: LogFields) => emit("warn", message, fields),
  error: (message: string, fields: LogFields) => emit("error", message, fields),
};
