import { BASE_URL } from "../../consts";

/**
 * Resolves a media URL from Strapi REST responses (flat v5 or nested v4-style).
 */
export function getStrapiMediaEntryUrl(media: unknown): string {
  if (media == null) return "";
  if (typeof media === "object" && media !== null && "url" in media) {
    const u = (media as { url?: unknown }).url;
    if (typeof u === "string" && u.length > 0) return u;
  }
  const m = media as {
    data?: { attributes?: { url?: string }; url?: string } | null;
  };
  const inner = m.data;
  if (inner && typeof inner === "object") {
    if (inner.attributes?.url) return inner.attributes.url;
    if (typeof inner.url === "string") return inner.url;
  }
  return "";
}

/** Absolute URL for Strapi uploads or remote CDN (matches StrapiImage / getStrapiMedia behavior). */
export function resolveStrapiAssetUrl(
  pathOrUrl: string | null | undefined
): string | undefined {
  if (pathOrUrl == null || pathOrUrl === "") return undefined;
  if (pathOrUrl.startsWith("data:")) return pathOrUrl;
  if (pathOrUrl.startsWith("http") || pathOrUrl.startsWith("//")) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${BASE_URL.replace(/\/$/, "")}${path}`;
}
