"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteAction } from "@/features/favorites/actions";

/** Tombol simpan — anonim diarahkan login oleh server (UNAUTHORIZED). */
export function FavoriteButton({ productSlug, initialSaved }: { productSlug: string; initialSaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function onClick(): Promise<void> {
    setPending(true);
    const res = await toggleFavoriteAction(productSlug);
    setPending(false);
    if (res.ok) {
      setSaved(res.data.saved);
    } else if (res.error.code === "UNAUTHORIZED") {
      router.push(`/login?next=/products/${productSlug}`);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={saved}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50"
    >
      {saved ? "★ Tersimpan" : "☆ Simpan"}
    </button>
  );
}
