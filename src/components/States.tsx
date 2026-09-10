import Link from "next/link";
import { copy } from "@/lib/copy";

/** Empty/error states berbahasa Indonesia (PRD §57–58). */
export function EmptyState({ title, body, ctaHref, ctaLabel }: { title: string; body: string; ctaHref?: string; ctaLabel?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{body}</p>
      {ctaHref && ctaLabel && (
        <p className="mt-4">
          <Link href={ctaHref} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
            {ctaLabel}
          </Link>
        </p>
      )}
    </div>
  );
}

export function ErrorState({ message }: { message?: string }) {
  return (
    <div role="alert" className="rounded-lg border border-zinc-200 px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{copy.errorGeneric.title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600">{message ?? copy.errorGeneric.body}</p>
    </div>
  );
}
