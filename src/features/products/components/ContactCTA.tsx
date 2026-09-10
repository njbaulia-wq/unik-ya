import { copy } from "@/lib/copy";
import type { DeveloperSocial } from "../repository";

/**
 * CTA developer (PRD §16): primer Hubungi Developer, sekunder Live Demo.
 * T14 menambah modal + pelacakan klik + rate-limit; di sini daftar kanal
 * publik (enabled saja) + deep-link langsung.
 */
const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  website: "Website",
  github: "GitHub",
  telegram: "Telegram",
  linkedin: "LinkedIn",
};

export function channelHref(channel: string, value: string): string {
  if (channel === "email") return `mailto:${value}`;
  if (channel === "whatsapp" && !value.startsWith("http")) {
    return `https://wa.me/${value.replace(/[^0-9]/g, "")}`;
  }
  return value;
}

export interface ContactCTAProps {
  demoUrl: string | null;
  socials: DeveloperSocial[];
}

/** Varian tanpa-JS (fallback): tautan langsung. Varian utama: ContactFlow modal. */
export function ContactCTA({ demoUrl, socials }: ContactCTAProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="nofollow noopener"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
        >
          {copy.liveDemo} ↗
        </a>
      )}
      <a href="#kontak-developer" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
        {copy.contactDeveloper}
      </a>
    </div>
  );
}

export function ContactChannels({ socials }: { socials: DeveloperSocial[] }) {
  if (socials.length === 0) {
    return <p className="text-sm text-zinc-600">Developer belum mencantumkan kontak publik.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {socials.map((s) => (
        <li key={s.channel}>
          <a
            href={channelHref(s.channel, s.value)}
            target={s.channel === "email" ? undefined : "_blank"}
            rel="nofollow noopener"
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            {CHANNEL_LABEL[s.channel] ?? s.channel}: {s.channel === "email" ? s.value : "Buka"}
          </a>
        </li>
      ))}
    </ul>
  );
}
