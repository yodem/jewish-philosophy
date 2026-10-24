import { NextResponse } from 'next/server';
import { FEEDBACK_TIMEOUT_MS } from './_deadline';

/** What the site tells the bridge about who is asking. Built on the server only; never taken from the browser. */
export interface BridgeUser {
  kind: 'google' | 'anon';
  id: string;
}

/** The bridge's 429 reason for the anonymous daily quota (the UI then asks the visitor to sign in). */
export const QUOTA_REASON = 'anon_daily_quota';
export const CONVERSATION_ID_RE = /^[0-9a-f]{32}$/;
export const TURN_ID_RE = /^[\w.:-]{1,128}$/;
/** The bridge's share ids: `secrets.token_urlsafe(16)` (22 chars), validated before any call. */
export const SHARE_ID_RE = /^[\w-]{16,64}$/;

export interface BridgeConfig {
  url: string;
  token: string;
}

/**
 * SADIK_BRIDGE_URL + SADIK_BRIDGE_TOKEN, or null when either is missing. On Vercel the URL must be https
 * (the bridge is reached through Tailscale Funnel); plain http is allowed only for local runs.
 */
export function bridgeConfig(env: Record<string, string | undefined> = process.env): BridgeConfig | null {
  const url = env.SADIK_BRIDGE_URL;
  const token = env.SADIK_BRIDGE_TOKEN;
  if (!url || !token) return null;
  if (env.VERCEL === '1' && !url.startsWith('https://')) return null;
  return { url, token };
}

export const notConfigured = () => NextResponse.json({ error: 'sadik chat is not configured' }, { status: 503 });

export class BridgeFailure extends Error {
  constructor(readonly kind: 'timeout' | 'unreachable') {
    super(`bridge ${kind}`);
  }
}

/**
 * A JSON call to the bridge: bearer auth, no cache, never follows a redirect, bounded by a timeout and the
 * client's own signal. The response is returned as is; callers map statuses.
 */
export async function bridgeFetch(
  config: BridgeConfig,
  path: string,
  init: { method: 'GET' | 'POST'; body?: unknown },
  signal?: AbortSignal,
  timeoutMs = FEEDBACK_TIMEOUT_MS,
): Promise<Response> {
  const signals = [AbortSignal.timeout(timeoutMs)];
  if (signal) signals.push(signal);
  try {
    return await fetch(new URL(path, config.url), {
      method: init.method,
      headers: {
        Authorization: `Bearer ${config.token}`,
        ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.any(signals),
    });
  } catch (err) {
    throw new BridgeFailure((err as Error).name === 'TimeoutError' ? 'timeout' : 'unreachable');
  }
}

export function failureResponse(err: unknown): NextResponse {
  if (err instanceof BridgeFailure && err.kind === 'timeout') return NextResponse.json({ error: 'bridge timed out' }, { status: 504 });
  return NextResponse.json({ error: 'bridge unreachable' }, { status: 502 });
}

/** Reads a small JSON error body from a non-ok bridge response; null when it is not JSON. */
export async function errorBody(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const text = await response.text();
    if (text.length > 4096) return null;
    const data: unknown = JSON.parse(text);
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
