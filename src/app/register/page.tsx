import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { registerAction } from "@/features/auth/actions";

export const metadata: Metadata = { title: "Daftar — DevMarket" };

export default function RegisterPage() {
  return (
    <main>
      <h1>Buat akun DevMarket</h1>
      <p>Satu akun untuk membeli dan mempublikasikan produk.</p>
      <AuthForm mode="register" action={registerAction} />
      <p>
        Sudah punya akun? <a href="/login">Masuk</a>
      </p>
    </main>
  );
}
