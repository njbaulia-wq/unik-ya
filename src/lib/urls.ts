/** L4 — validasi URL eksternal: hanya https://, tolak javascript:/data: (PRD §70). */
export function isHttpsUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

const YOUTUBE_HOSTS = new Set(["www.youtube.com", "youtube.com", "youtu.be", "www.youtu.be", "m.youtube.com"]);

/** Video demo: embed YouTube saja (keputusan #7), tanpa upload video. */
export function isAllowedVideoUrl(value: string): boolean {
  if (!isHttpsUrl(value)) return false;
  try {
    return YOUTUBE_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

/** Link eksternal aman untuk target blank. */
export function externalRel(): string {
  return "nofollow noopener";
}
