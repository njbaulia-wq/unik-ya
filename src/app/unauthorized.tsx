import Link from "next/link";
import { copy } from "@/lib/copy";

export default function Unauthorized() {
  return (
    <main className="container-page py-12 text-center">
      <h1 className="text-lg font-semibold">{copy.unauthorized.title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{copy.unauthorized.body}</p>
      <p className="mt-4">
        <Link href="/login" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          {copy.unauthorized.cta}
        </Link>
      </p>
    </main>
  );
}
