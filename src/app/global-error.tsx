"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { copy } from "@/lib/copy";

/** Error boundary L1 — render pesan aman, log cause ke server-side logger. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Render error boundary.", { module: "ui", errorCode: "INTERNAL" });
  }, [error]);

  return (
    <html lang="id">
      <body>
        <main className="container-page py-12 text-center">
          <h1 className="text-lg font-semibold">{copy.errorGeneric.title}</h1>
          <p className="mt-2 text-sm text-zinc-600">{copy.errorGeneric.body}</p>
          <p className="mt-4">
            <button type="button" onClick={reset} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
              {copy.errorGeneric.cta}
            </button>
          </p>
        </main>
      </body>
    </html>
  );
}
