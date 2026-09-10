"use client";

import { useState } from "react";
import { updateProfileAction } from "@/features/developers/actions";
import type { OwnDeveloper } from "@/features/developers/repository";

/** Form profil — error aksesibel per-field dari VALIDATION_ERROR. */
export function ProfileForm({ developer }: { developer: OwnDeveloper }) {
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await updateProfileAction({
      displayName: String(fd.get("displayName") ?? ""),
      bio: String(fd.get("bio") ?? ""),
      websiteUrl: String(fd.get("websiteUrl") ?? ""),
      githubUrl: String(fd.get("githubUrl") ?? ""),
    });
    setMsg(res.ok ? "Profil tersimpan." : res.error.message);
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 flex max-w-lg flex-col gap-3">
      <div>
        <label htmlFor="displayName">Nama tampilan</label>
        <input id="displayName" name="displayName" defaultValue={developer.display_name} required className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="bio">Bio</label>
        <textarea id="bio" name="bio" defaultValue={developer.bio} rows={4} maxLength={500} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="websiteUrl">Website</label>
        <input id="websiteUrl" name="websiteUrl" type="url" defaultValue={developer.website_url ?? ""} placeholder="https://" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label htmlFor="githubUrl">GitHub</label>
        <input id="githubUrl" name="githubUrl" type="url" defaultValue={developer.github_url ?? ""} placeholder="https://" className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
      </div>
      {msg && <p role="status" className="text-sm">{msg}</p>}
      <button type="submit" className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">Simpan</button>
    </form>
  );
}
