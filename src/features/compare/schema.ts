import { z } from "zod";
import { slugSchema } from "@/features/products/schema";

/**
 * Kontrak compare P2 (keputusan #12): `/compare?a=slug1&b=slug2[&c=][&d=]`.
 * 2–4 slug unik, published-only. V1: hanya kontrak + service + test.
 */
export const compareParamsSchema = z
  .strictObject({
    a: slugSchema,
    b: slugSchema,
    c: slugSchema.optional(),
    d: slugSchema.optional(),
  })
  .refine(
    (v) => {
      const slugs = [v.a, v.b, v.c, v.d].filter(Boolean);
      return slugs.length >= 2 && new Set(slugs).size === slugs.length;
    },
    { message: "Bandingkan 2–4 produk berbeda." },
  );

export type CompareParams = z.infer<typeof compareParamsSchema>;

export function compareSlugs(params: CompareParams): string[] {
  return [params.a, params.b, params.c, params.d].filter((s): s is string => !!s);
}
