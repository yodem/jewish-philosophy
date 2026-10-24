import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import type { BridgeUser } from './_bridge';

export type AuthState = 'disabled' | 'signed_out' | 'signed_in';

const UID_RE = /^[0-9a-f]{64}$/;

/** Google sign-in is offered only when its server env is complete. */
export function authConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return !!(env.AUTH_SECRET && env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
}

/** Auth.js cookies are `__Secure-`/`__Host-` prefixed on HTTPS and always on Vercel (shared with src/auth.ts). */
export function secureAuthCookies(env: Record<string, string | undefined> = process.env): boolean {
  return env.VERCEL === '1' || (env.AUTH_URL ?? '').startsWith('https://');
}

/**
 * The signed-in user's id (sha256 of the Google `sub`) from the Auth.js session cookie, verified and decrypted with
 * AUTH_SECRET (expiry checked); null when signed out, expired, tampered with, or sign-in is not configured.
 * Only the cookie is read: an Authorization header from the browser is never consulted.
 */
export async function googleUserId(request: NextRequest): Promise<string | null> {
  if (!authConfigured()) return null;
  const token = await getToken({
    req: { headers: new Headers({ cookie: request.headers.get('cookie') ?? '' }) },
    secret: process.env.AUTH_SECRET,
    secureCookie: secureAuthCookies(),
  });
  const uid = token?.uid;
  return typeof uid === 'string' && UID_RE.test(uid) ? uid : null;
}

/**
 * Resolves who is asking, on the server only. Any `user` / `kind` in the browser's request body is ignored.
 * Signed in (Auth.js Google) → `{kind: "google", id: sha256(sub)}`; otherwise the anonymous session cookie.
 */
export async function resolveUser(request: NextRequest, session: { id: string }): Promise<BridgeUser> {
  const uid = await googleUserId(request);
  return uid ? { kind: 'google', id: uid } : { kind: 'anon', id: session.id };
}

export async function authState(request: NextRequest): Promise<AuthState> {
  if (!authConfigured()) return 'disabled';
  return (await googleUserId(request)) ? 'signed_in' : 'signed_out';
}
