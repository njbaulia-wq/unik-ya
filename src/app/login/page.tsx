import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { loginAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Masuk — DevMarket" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  async function loginWithNext(form: { email: string; password: string; displayName: string }) {
    "use server";
    return loginAction({ email: form.email, password: form.password }, next);
  }
  return (
    <main>
      <h1>Masuk ke DevMarket</h1>
      <AuthForm mode="login" action={loginWithNext} />
      <p>
        Belum punya akun? <a href="/register">Daftar</a>
      </p>
      <p>
        <a href="/login/google">Masuk dengan Google</a>
      </p>
    </main>
  );
}
