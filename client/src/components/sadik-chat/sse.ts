import type { SSEEvent } from './types';

/**
 * Incremental SSE parser. Feed each decoded network chunk with the same `buf`;
 * returns the events completed by this chunk and keeps any partial event in
 * `buf.rest`. A CR ends a line at once; `buf.skipLf` remembers it so an LF
 * opening the next chunk (a CRLF split across chunks) is not a second line
 * ending. Events whose `data` is not valid JSON are skipped.
 */
export function parseSSE(chunk: string, buf: { rest: string; skipLf?: boolean }): SSEEvent[] {
  if (chunk.length > 0) {
    // The pending LF belongs to the previous CR: drop it, and clear the flag even when it was the whole chunk.
    if (buf.skipLf && chunk.startsWith('\n')) chunk = chunk.slice(1);
    buf.skipLf = chunk.endsWith('\r');
  }
  const text = (buf.rest + chunk).replace(/\r\n?/g, '\n');
  const blocks = text.split('\n\n');
  buf.rest = blocks.pop() ?? '';

  const events: SSEEvent[] = [];
  for (const block of blocks) {
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith(':')) continue;
      const sep = line.indexOf(':');
      const field = sep === -1 ? line : line.slice(0, sep);
      const value = sep === -1 ? '' : line.slice(sep + 1).replace(/^ /, '');
      if (field === 'event') event = value;
      else if (field === 'data') dataLines.push(value);
    }
    if (dataLines.length === 0) continue;
    try {
      events.push({ event, data: JSON.parse(dataLines.join('\n')) });
    } catch {
      // ignore malformed event
    }
  }
  return events;
}
