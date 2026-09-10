/** L4 — aturan upload image (PRD §53, keputusan #7). */
export const IMAGE_MIME_ALLOWLIST = ["image/jpeg", "image/png", "image/webp"] as const;
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGES_MAX_COUNT = 5;

export function isAllowedImage(mime: string, size: number): boolean {
  return (IMAGE_MIME_ALLOWLIST as readonly string[]).includes(mime) && size > 0 && size <= IMAGE_MAX_BYTES;
}

/** Sanitasi filename: huruf-angka-titik-strip saja, tanpa path traversal. */
export function sanitizeFilename(name: string): string {
  const base = name.split("/").pop()?.split("\\").pop() ?? "file";
  const clean = base.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^\.+/, "");
  return clean.slice(0, 80) || "file";
}
