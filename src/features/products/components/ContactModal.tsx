"use client";

import { useRef, useState } from "react";
import { copy } from "@/lib/copy";
import { channelHref, type ContactCTAProps } from "./ContactCTA";
import type { DeveloperSocial } from "../repository";

/**
 * Alur kontak (PRD §17): klik Hubungi Developer → dialog daftar kanal →
 * klik kanal (tercatat, reveal-on-click) → deep-link. Tanpa login, tanpa chat.
 */
export function ContactFlow({ demoUrl, socials, productSlug }: ContactCTAProps & { productSlug: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function openDialog(): void {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function close(): void {
    setOpen(false);
    dialogRef.current?.close();
  }

  async function track(channel: string): Promise<void> {
    try {
      await fetch("/api/contact-click", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productSlug, channel }),
      });
    } catch {
      // Pelacakan gagal → tetap buka link (jangan blokir user).
    }
  }

  async function openChannel(s: DeveloperSocial): Promise<void> {
    await track(s.channel);
    window.open(channelHref(s.channel, s.value), s.channel === "email" ? "_self" : "_blank", "noopener");
  }

  async function openDemo(): Promise<void> {
    if (!demoUrl) return;
    await track("demo");
    window.open(demoUrl, "_blank", "noopener");
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {demoUrl && (
          <button type="button" onClick={openDemo} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
            {copy.liveDemo} ↗
          </button>
        )}
        <button type="button" onClick={openDialog} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
          {copy.contactDeveloper}
        </button>
      </div>
      <dialog
        ref={dialogRef}
        aria-label="Cara menghubungi developer"
        onClose={close}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
        className="rounded-lg border border-zinc-200 p-6"
      >
        {open && (
          <div>
            <h2 className="font-semibold">Cara menghubungi developer</h2>
            {socials.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600">Developer belum mencantumkan kontak publik.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {socials.map((s) => (
                  <li key={s.channel}>
                    <button
                      type="button"
                      onClick={() => openChannel(s)}
                      className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-left text-sm"
                    >
                      {s.channel === "email" ? `Kirim Email` : `Buka ${s.channel}`} →
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={close} className="mt-4 text-sm text-zinc-600">
              Tutup
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
