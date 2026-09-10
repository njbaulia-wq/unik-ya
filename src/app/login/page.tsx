import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { loginAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Masuk — DevMarket" };

export default function LoginPage() {
  return (
    <main>
      <h1>Masuk ke DevMarket</h1>
      <AuthForm mode="login" action={loginAction} />
      <p>
        Belum punya akun? <a href="/register">Daftar</a>
      </p>
      <p>
        <a href="/login/google">Masuk dengan Google</a>
      </p>
    </main>
  );
}
