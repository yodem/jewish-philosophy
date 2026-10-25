export const HEADERS_TIMEOUT_MS = 30_000;
export const STREAM_TIMEOUT_MS = 240_000;
export const FEEDBACK_TIMEOUT_MS = 10_000;
export const TIMEOUT_MESSAGE = 'התשובה התעכבה יותר מדי. נסו שוב מאוחר יותר.';

export class BridgeTimeoutError extends Error {
  constructor() {
    super('bridge timed out');
    this.name = 'BridgeTimeoutError';
  }
}

/**
 * Fetches the bridge with two deadlines combined with the client's own signal:
 * headers must arrive within `headersMs`, and the whole stream must finish within
 * `totalMs`. A header timeout throws BridgeTimeoutError; a stream timeout ends
 * the returned body with a Hebrew SSE `error` event. `body` is null for a
 * non-ok response; `errorJson` is then its small JSON body (e.g. the bridge's
 * `{reason: "anon_daily_quota"}`), or null.
 */
export async function fetchBridgeStream(
  url: URL | string,
  init: RequestInit,
  clientSignal: AbortSignal,
  { headersMs = HEADERS_TIMEOUT_MS, totalMs = STREAM_TIMEOUT_MS } = {},
): Promise<{ response: Response; body: ReadableStream<Uint8Array> | null; errorJson?: Record<string, unknown> | null }> {
  const deadline = new AbortController();
  let timedOut = false;
  const expire = () => {
    timedOut = true;
    deadline.abort();
  };
  const headerTimer = setTimeout(expire, headersMs);
  const totalTimer = setTimeout(expire, totalMs);
  const clear = () => {
    clearTimeout(headerTimer);
    clearTimeout(totalTimer);
  };

  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.any([clientSignal, deadline.signal]) });
  } catch (err) {
    clear();
    if (timedOut) throw new BridgeTimeoutError();
    throw err;
  }
  clearTimeout(headerTimer);

  if (!response.ok || !response.body) {
    let errorJson: Record<string, unknown> | null = null;
    try {
      const text = response.body ? await response.text() : '';
      const data: unknown = text.length <= 4096 ? JSON.parse(text) : null;
      if (data && typeof data === 'object' && !Array.isArray(data)) errorJson = data as Record<string, unknown>;
    } catch {
      // not JSON: no detail
    }
    clear();
    return { response, body: null, errorJson };
  }

  const reader = response.body.getReader();
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          clear();
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (err) {
        clear();
        if (timedOut) {
          controller.enqueue(
            new TextEncoder().encode(`event: error\ndata: ${JSON.stringify({ message: TIMEOUT_MESSAGE })}\n\n`),
          );
          controller.close();
        } else {
          controller.error(err);
        }
      }
    },
    cancel(reason) {
      clear();
      return reader.cancel(reason);
    },
  });
  return { response, body };
}
