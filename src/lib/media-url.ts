/**
 * Normalize API media paths for Next.js `Image` and rewrites.
 * Prefer same-origin `/uploads/...` so `next.config` rewrites proxy to the API
 * and we avoid configuring remotePatterns for localhost in dev.
 */
export function toSiteRelativeMediaSrc(
  pathOrUrl: string | undefined | null,
  fallback = "/assets/products/placeholder.jpg",
): string {
  if (!pathOrUrl?.trim()) return fallback;
  const s = pathOrUrl.trim();
  if (s.startsWith("/")) return s;
  if (s.startsWith("data:")) return s;
  try {
    const u = new URL(s);
    return u.pathname + u.search;
  } catch {
    return s.startsWith("/") ? s : `/${s}`;
  }
}

/**
 * For `<img>` / previews: same-origin `/uploads/...` when the API returns a full URL,
 * but keep absolute URLs for external CDNs (path does not start with `/uploads/`).
 */
export function toDisplayableMediaSrc(
  pathOrUrl: string | undefined | null,
  fallback = "/assets/products/placeholder.jpg",
): string {
  if (!pathOrUrl?.trim()) return fallback;
  const s = pathOrUrl.trim();
  if (s.startsWith("/")) return s;
  if (s.startsWith("data:")) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) {
    try {
      const u = new URL(s);
      if (u.pathname.startsWith("/uploads/")) {
        return u.pathname + (u.search || "");
      }
      return s;
    } catch {
      return fallback;
    }
  }
  return s.startsWith("/") ? s : `/${s}`;
}
