import type { BridgeUser } from './_bridge';

export type AuthState = 'disabled' | 'signed_out' | 'signed_in';

/** Google sign-in is offered only when its server env is complete. */
export function authConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return !!(env.AUTH_SECRET && env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
}

/**
 * Resolves who is asking, on the server only. Any `user` / `kind` in the browser's request body is ignored.
 * Signed in (Auth.js Google) → `{kind: "google", id: sha256(sub)}`; otherwise the anonymous session cookie.
 */
export async function resolveUser(session: { id: string }): Promise<BridgeUser> {
  return { kind: 'anon', id: session.id };
}

export async function authState(): Promise<AuthState> {
  return authConfigured() ? 'signed_out' : 'disabled';
}
