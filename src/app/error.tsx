"use client";

import { copy } from "@/lib/copy";

export default function RouteError() {
  return (
    <main className="container-page py-12 text-center">
      <h1 className="text-lg font-semibold">{copy.errorGeneric.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{copy.errorGeneric.body}</p>
    </main>
  );
}
