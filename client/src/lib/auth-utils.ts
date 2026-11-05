import { createHash } from 'node:crypto';

/** The bridge identity of a Google user: sha256 of the OIDC `sub` (never the email). */
export function userIdFromSub(sub: string): string {
  return createHash('sha256').update(sub).digest('hex');
}

/** Same-origin relative paths only; anything else (other hosts, `//host`, look-alike origins) lands on the site root. */
export function safeRedirect(url: string, baseUrl: string): string {
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) return `${baseUrl}${url}`;
  try {
    const target = new URL(url);
    if (target.origin === new URL(baseUrl).origin) return target.toString();
  } catch {
    // not a URL
  }
  return baseUrl;
}
