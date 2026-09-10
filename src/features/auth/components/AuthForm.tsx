"use client";

import { useState } from "react";

interface Props {
  mode: "login" | "register";
  action: (form: { email: string; password: string; displayName: string }) => Promise<
    | { ok: true; data: unknown }
    | { ok: false; error: { message: string; details?: { field: string; message: string }[] } }
  >;
}

/** Form auth — error aksesibel per-field dari AppError VALIDATION_ERROR. */
export function AuthForm({ mode, action }: Props) {
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});
    const fd = new FormData(e.currentTarget);
    const res = await action({
      email: String(fd.get("email") ?? ""),
      password: String(fd.get("password") ?? ""),
      displayName: String(fd.get("displayName") ?? ""),
    });
    setPending(false);
    if (!res.ok) {
      setFormError(res.error.message);
      const fe: Record<string, string> = {};
      for (const d of res.error.details ?? []) fe[d.field] = d.message;
      setFieldErrors(fe);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={mode === "login" ? "Masuk" : "Daftar"}>
      {mode === "register" && (
        <div>
          <label htmlFor="displayName">Nama tampilan</label>
          <input id="displayName" name="displayName" required autoComplete="name" aria-invalid={!!fieldErrors.displayName} />
          {fieldErrors.displayName && <p role="alert">{fieldErrors.displayName}</p>}
        </div>
      )}
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" aria-invalid={!!fieldErrors.email} />
        {fieldErrors.email && <p role="alert">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "register" ? 8 : undefined}
          aria-invalid={!!fieldErrors.password}
        />
        {fieldErrors.password && <p role="alert">{fieldErrors.password}</p>}
      </div>
      {formError && <p role="alert">{formError}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
      </button>
    </form>
  );
}
