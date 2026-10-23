import type { BotMessage, ChatMessage, Citation, FurtherReading, SourceType, SSEEvent, Speaker } from './types';

export const SOURCE_TYPES: readonly SourceType[] = [
  'responsa',
  'writing',
  'blog',
  'term',
  'video',
  'playlist',
  'academic',
  'comment',
  'primary',
];
export const SPEAKERS: readonly Speaker[] = ['sadik', 'visitor', 'maimonides'];

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const optString = (v: unknown) => v === undefined || typeof v === 'string';

/** Returns a normalised Citation, or null when any field is missing or has the wrong type. */
export function parseCitation(c: unknown): Citation | null {
  if (!isRecord(c)) return null;
  const { n, chunk_id, title, url, source_type, speaker, quote, locator_label, kind } = c;
  if (typeof n !== 'number' || !Number.isFinite(n)) return null;
  if (typeof title !== 'string' || typeof url !== 'string') return null;
  if (!SOURCE_TYPES.includes(source_type as SourceType)) return null;
  if (!SPEAKERS.includes(speaker as Speaker)) return null;
  if (!optString(chunk_id) || !(optString(quote) || quote === null)) return null;
  if (!(optString(locator_label) || locator_label === null)) return null;
  if (kind !== undefined && kind !== 'quote' && kind !== 'reference') return null;
  const out: Citation = {
    n,
    chunk_id: (chunk_id as string | undefined) ?? '',
    title,
    url,
    source_type: source_type as SourceType,
    speaker: speaker as Speaker,
    quote: (quote as string | null | undefined) ?? null,
  };
  if (typeof locator_label === 'string' || locator_label === null) out.locator_label = locator_label;
  if (kind !== undefined) out.kind = kind;
  return out;
}

function parseFurther(list: unknown): FurtherReading[] | null {
  if (list === undefined) return [];
  if (!Array.isArray(list)) return null;
  const out: FurtherReading[] = [];
  for (const f of list) {
    if (!isRecord(f)) return null;
    const { title, url, locator_label, source_type } = f;
    if (typeof title !== 'string' || typeof url !== 'string') return null;
    if (!SOURCE_TYPES.includes(source_type as SourceType)) return null;
    if (!(optString(locator_label) || locator_label === null)) return null;
    out.push({ title, url, locator_label: (locator_label as string | null | undefined) ?? null, source_type: source_type as SourceType });
  }
  return out;
}

function parseCitations(list: unknown): Citation[] | null {
  if (!Array.isArray(list)) return null;
  const out: Citation[] = [];
  for (const c of list) {
    const parsed = parseCitation(c);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

/** Validates a message read back from localStorage; null drops it. */
export function parseStoredMessage(m: unknown): ChatMessage | null {
  if (!isRecord(m) || typeof m.text !== 'string') return null;
  if (m.role === 'user') return { role: 'user', text: m.text };
  if (m.role !== 'bot') return null;
  if (!optString(m.turn_id)) return null;
  if (m.vote !== undefined && m.vote !== 'up' && m.vote !== 'down') return null;
  const citations = parseCitations(m.citations);
  if (!citations) return null;
  const further = parseFurther(m.further_reading);
  if (!further) return null;
  const bot: BotMessage = { role: 'bot', text: m.text, citations };
  if (further.length) bot.further_reading = further;
  if (m.turn_id !== undefined) bot.turn_id = m.turn_id as string;
  if (m.vote !== undefined) bot.vote = m.vote as BotMessage['vote'];
  if (m.error === true) bot.error = true;
  return bot;
}

export type ParsedEvent =
  | { kind: 'delta'; text: string }
  | { kind: 'final'; text: string; citations: Citation[]; further_reading: FurtherReading[]; abstained: boolean; turn_id?: string }
  | { kind: 'error'; message: string }
  | { kind: 'invalid' };

/** Validates one SSE event; null means an event type the UI does not handle. */
export function parseSseEvent(ev: SSEEvent): ParsedEvent | null {
  if (ev.event !== 'delta' && ev.event !== 'final' && ev.event !== 'error') return null;
  const d = ev.data;
  if (!isRecord(d)) return { kind: 'invalid' };
  if (ev.event === 'delta') {
    return typeof d.text === 'string' ? { kind: 'delta', text: d.text } : { kind: 'invalid' };
  }
  if (ev.event === 'error') {
    return typeof d.message === 'string' ? { kind: 'error', message: d.message } : { kind: 'invalid' };
  }
  const citations = parseCitations(d.citations);
  const further = parseFurther(d.further_reading);
  if (typeof d.text !== 'string' || !citations || !further || typeof d.abstained !== 'boolean' || !optString(d.turn_id)) {
    return { kind: 'invalid' };
  }
  const out: ParsedEvent = { kind: 'final', text: d.text, citations, further_reading: further, abstained: d.abstained };
  if (typeof d.turn_id === 'string' && d.turn_id) out.turn_id = d.turn_id;
  return out;
}
