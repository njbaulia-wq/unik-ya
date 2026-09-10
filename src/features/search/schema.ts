import { z } from "zod";

/** L2/L1 kontrak search katalog (PRD §23–24). */
export const sortSchema = z.enum(["relevance", "newest", "updated", "popular"]);

export const searchParamsSchema = z.strictObject({
  q: z.string().trim().max(100).optional(),
  category: z.string().trim().toLowerCase().max(60).optional(),
  productType: z.string().trim().max(40).optional(),
  technology: z.string().trim().max(40).optional(),
  verified: z.enum(["true", "false"]).optional(),
  hasDemo: z.enum(["true", "false"]).optional(),
  sort: sortSchema.optional().default("relevance"),
  page: z.coerce.number().int().min(1).max(100).optional().default(1),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type SortKey = z.infer<typeof sortSchema>;

export const PER_PAGE = 12;
