import { z } from "zod";

/** L2/L1 kontrak auth — email/password + validasi server-side (PRD §49). */
export const emailSchema = z.string().trim().toLowerCase().email("Alamat email tidak valid.");

export const passwordSchema = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(128, "Kata sandi maksimal 128 karakter.");

export const loginSchema = z.strictObject({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export const registerSchema = z
  .strictObject({
    email: emailSchema,
    password: passwordSchema,
    displayName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80, "Nama maksimal 80 karakter."),
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
