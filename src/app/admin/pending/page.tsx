import { createServerSupabase } from "@/lib/db";
import { listReviewQueue } from "@/features/admin/repository";
import { moderateAction } from "@/features/admin/actions";

const ACTIONS = [
  { value: "to_under_review", label: "Mulai review" },
  { value: "approve", label: "Setujui" },
  { value: "reject", label: "Tolak (wajib alasan)" },
  { value: "publish", label: "Publish" },
  { value: "suspend", label: "Suspend (wajib alasan)" },
] as const;

/** Antrian review — tiap aksi tercatat di audit_logs. */
export default async function PendingPage() {
  let queue: Awaited<ReturnType<typeof listReviewQueue>> = [];
  try {
    const supabase = await createServerSupabase();
    queue = await listReviewQueue(supabase);
  } catch {
    queue = [];
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Antrian Review</h1>
      {queue.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-600">Tidak ada produk menunggu review.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {queue.map((p) => (
            <li key={p.id} className="rounded-lg border border-zinc-200 p-4">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-zinc-500">
                {p.developers?.display_name} · {p.status} · skor {p.verification_score}
              </p>
              <form
                className="mt-3 flex flex-wrap items-center gap-2 text-sm"
                action={async (fd: FormData) => {
                  "use server";
                  await moderateAction({
                    productId: String(fd.get("productId")),
                    action: String(fd.get("action")),
                    reason: String(fd.get("reason") ?? ""),
                  });
                }}
              >
                <input type="hidden" name="productId" value={p.id} />
                <label>
                  Aksi{" "}
                  <select name="action" className="rounded-lg border border-zinc-300 px-2 py-1.5">
                    {ACTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Alasan{" "}
                  <input name="reason" placeholder="wajib untuk tolak/suspend" className="rounded-lg border border-zinc-300 px-2 py-1.5" />
                </label>
                <button type="submit" className="rounded-lg bg-zinc-900 px-3 py-1.5 text-white">
                  Jalankan
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
