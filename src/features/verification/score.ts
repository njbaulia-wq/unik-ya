import type { ScoreInput } from "./schema";

/**
 * Skor kualitas deterministik 0–100 (keputusan #3, ARCHITECTURE.md §5).
 * Bobot transparan — siap diupgrade ke evaluasi AI Phase 4 tanpa ganti model.
 */
export const SCORE_WEIGHTS = {
  demo: 20,
  docs: 15,
  screenshotsFull: 15, // ≥3 gambar
  screenshotsPartial: 7, // 1–2 gambar
  repo: 10,
  license: 10, // bukan custom/kosong
  version: 10,
  description: 10, // ≥200 karakter
  techStack: 10, // ≥2 item
} as const;

export function computeVerificationScore(input: ScoreInput): number {
  let score = 0;
  if (input.hasDemo) score += SCORE_WEIGHTS.demo;
  if (input.hasDocs) score += SCORE_WEIGHTS.docs;
  if (input.screenshotCount >= 3) score += SCORE_WEIGHTS.screenshotsFull;
  else if (input.screenshotCount >= 1) score += SCORE_WEIGHTS.screenshotsPartial;
  if (input.hasRepo) score += SCORE_WEIGHTS.repo;
  const lic = input.licenseType.trim().toLowerCase();
  if (lic !== "" && lic !== "custom") score += SCORE_WEIGHTS.license;
  if (/^\d+\.\d+(\.\d+)?$/.test(input.version.trim())) score += SCORE_WEIGHTS.version;
  if (input.descriptionLength >= 200) score += SCORE_WEIGHTS.description;
  if (input.techStackCount >= 2) score += SCORE_WEIGHTS.techStack;
  return Math.min(100, Math.max(0, score));
}
