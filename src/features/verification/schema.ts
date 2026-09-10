import { z } from "zod";

/** Input sinyal skor — semuanya terukur deterministik (keputusan #3). */
export const scoreInputSchema = z.strictObject({
  hasDemo: z.boolean(),
  hasDocs: z.boolean(),
  screenshotCount: z.number().int().min(0).max(20),
  hasRepo: z.boolean(),
  licenseType: z.string().trim().max(60),
  version: z.string().trim().max(20),
  descriptionLength: z.number().int().min(0),
  techStackCount: z.number().int().min(0),
});

export type ScoreInput = z.infer<typeof scoreInputSchema>;
