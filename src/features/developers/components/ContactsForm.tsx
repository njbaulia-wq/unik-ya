"use client";

import { useState } from "react";
import { CHANNELS, type Channel } from "@/features/developers/schema";
import { updateSocialsAction } from "@/features/developers/actions";

interface Row {
  channel: Channel;
  value: string;
  enabled: boolean;
}

/** Form kontak per-channel — hanya enabled yang tampil publik. */
export function ContactsForm({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(
    CHANNELS.map((c) => initial.find((r) => r.channel === c) ?? { channel: c, value: "", enabled: false }),
  );
  const [msg, setMsg] = useState<string | null>(null);

  function set(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await updateSocialsAction(rows);
    setMsg(res.ok ? "Kontak tersimpan." : res.error.message);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex max-w-lg flex-col gap-3">
      {rows.map((r, i) => (
        <div key={r.channel} className="flex items-center gap-2">
          <label className="flex flex-1 flex-col gap-1 text-sm">
            {r.channel}
            <input
              value={r.value}
              onChange={(e) => set(i, { value: e.target.value })}
              placeholder={r.channel === "email" ? "nama@email.com" : "https://… / nomor WA"}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={r.enabled} onChange={(e) => set(i, { enabled: e.target.checked })} />
            Tampil
          </label>
        </div>
      ))}
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <button type="submit" className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Simpan</button>
    </form>
  );
}
