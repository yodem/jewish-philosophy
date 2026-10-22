import type { SSEEvent } from './types';

/**
 * Incremental SSE parser. Feed each decoded network chunk with the same `buf`;
 * returns the events completed by this chunk and keeps any partial event in
 * `buf.rest`. Events whose `data` is not valid JSON are skipped.
 */
export function parseSSE(chunk: string, buf: { rest: string }): SSEEvent[] {
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
