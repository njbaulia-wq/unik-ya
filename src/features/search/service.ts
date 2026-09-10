import { logger } from "@/lib/logger";
import { validationError } from "@/lib/error";
import { searchParamsSchema, type SearchParams } from "./schema";
import type { SearchResult, SearchResult as RepoResult } from "./repository";

/**
 * L2 search service — validasi boundary (Zod) + orkestrasi + logging operasional.
 * Event bisnis `search` dicatat terpisah di T15 (analytics).
 */
export async function runSearch(
  raw: Record<string, string | string[] | undefined>,
  deps: { search: (p: SearchParams) => Promise<RepoResult> },
  ctx: { requestId?: string },
): Promise<SearchResult & { applied: SearchParams }> {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === "string") flat[k] = v;
    else if (Array.isArray(v) && typeof v[0] === "string") flat[k] = v[0] as string;
  }
  const parsed = searchParamsSchema.safeParse(flat);
  if (!parsed.success) {
    throw validationError(parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "q"), message: i.message })));
  }
  const started = Date.now();
  try {
    const result = await deps.search(parsed.data);
    logger.info("Pencarian katalog.", {
      module: "search",
      action: "search",
      requestId: ctx.requestId,
      query: parsed.data.q ?? "",
      resultCount: result.total,
      durationMs: Date.now() - started,
    });
    return { ...result, applied: parsed.data };
  } catch (err) {
    logger.error("Pencarian katalog gagal.", {
      module: "search",
      action: "search",
      requestId: ctx.requestId,
      errorCode: "UPSTREAM_ERROR",
    });
    throw err;
  }
}
