"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { runAction } from "@/lib/action";
import { logger } from "@/lib/logger";
import { validationError } from "@/lib/error";
import { loginSchema, registerSchema } from "@/features/auth/schema";
import { ensureDeveloper, ensureProfile } from "@/features/auth/repository";
import { isAuthFailure, mapSupabaseAuthError, postLoginRedirect, slugifyName } from "@/features/auth/service";
import { getAuthUser } from "@/lib/auth";

/** L1 Server Actions auth — tipis: validate → supabase → map error via AppError. */
async function reqId(): Promise<string | undefined> {
  return (await headers()).get("x-request-id") ?? undefined;
}

export async function loginAction(form: { email: string; password: string }, next?: string) {
  const requestId = await reqId();
  const parsed = loginSchema.safeParse(form);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: validationError(
        parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })),
      ).toJSON().error,
    };
  }
  const result = await runAction(
    async () => {
      const supabase = await createServerSupabase();
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) {
        if (isAuthFailure(error.message)) mapSupabaseAuthError(error);
        throw new Error("Masuk gagal. Coba lagi.");
      }
      const user = await getAuthUser(supabase);
      logger.info("Login berhasil.", { module: "auth", requestId, userId: user?.id });
      return { redirectTo: postLoginRedirect({ isAdmin: user?.isAdmin ?? false, developerId: user?.developerId ?? null }, next) };
    },
    { module: "auth", action: "login", requestId },
  );
  if (result.ok) {
    revalidatePath("/");
    redirect(result.data.redirectTo);
  }
  return result;
}

export async function registerAction(form: { email: string; password: string; displayName: string }) {
  const requestId = await reqId();
  const parsed = registerSchema.safeParse(form);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: validationError(
        parsed.error.issues.map((i) => ({ field: String(i.path[0] ?? "form"), message: i.message })),
      ).toJSON().error,
    };
  }
  const result = await runAction(
    async () => {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error || !data.user) {
        logger.warn("Registrasi gagal.", { module: "auth", requestId, errorCode: "VALIDATION_ERROR" });
        throw validationError([{ field: "email", message: "Email sudah terdaftar atau tidak valid." }]);
      }
      await ensureProfile(supabase, { userId: data.user.id, email: parsed.data.email, requestId });
      await ensureDeveloper(supabase, {
        userId: data.user.id,
        displayName: parsed.data.displayName,
        slug: `${slugifyName(parsed.data.displayName)}-${data.user.id.slice(0, 6)}`,
        requestId,
      });
      logger.info("Registrasi berhasil.", { module: "auth", requestId, userId: data.user.id });
      return { redirectTo: "/dashboard" };
    },
    { module: "auth", action: "register", requestId },
  );
  if (result.ok) {
    revalidatePath("/");
    redirect(result.data.redirectTo);
  }
  return result;
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/");
  redirect("/");
}
