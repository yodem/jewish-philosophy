import type { SourceType } from './types';

/** http(s) or same-site relative links only; anything else (javascript:, data:, //host) renders as text. */
export function safeUrl(url: string): string | null {
  return /^(https?:\/\/|\/(?!\/))/.test(url) ? url : null;
}

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
const TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];

/**
 * The Hebrew-letter numeral printed books use for glosses: 1 → א, 10 → י, 15 → טו, 16 → טז, 42 → מב.
 * Numbers outside 1..99 fall back to digits.
 */
export function glossLetter(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 99) return String(n);
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  return TENS[Math.floor(n / 10)] + ONES[n % 10];
}

/** The word for each kind of source (no colour coding: the label carries the meaning). */
const KIND_LABEL: Record<string, string> = {
  responsa: 'שו״ת',
  comment: 'תגובה',
  writing: 'כתב',
  blog: 'בלוג',
  term: 'מושג',
  video: 'הרצאה',
  playlist: 'סדרת שיעורים',
  academic: 'מאמר',
  article: 'מאמר',
  web: 'אתר',
  primary: 'מקור',
};

export function kindLabel(type: SourceType): string {
  return KIND_LABEL[type] ?? 'מקור';
}

/** "▶ 05:14" for a video moment, "עמ׳ 7" for a page. */
export function locatorText(label?: string | null): string | null {
  if (!label) return null;
  return /^\d/.test(label) ? `▶ ${label}` : label;
}

export type Tone = 'video' | 'series' | 'blog' | 'responsa' | 'writing' | 'term' | 'neutral';

/** The site's content-type colour for each kind of source (DESIGN.md: וידאו blue, סדרה purple, בלוג green, שו״ת orange, כתב teal, מושג pink). */
const TONE: Record<string, Tone> = {
  video: 'video',
  playlist: 'series',
  blog: 'blog',
  responsa: 'responsa',
  comment: 'responsa',
  writing: 'writing',
  academic: 'writing',
  article: 'writing',
  term: 'term',
};

export function kindTone(type: SourceType): Tone {
  return TONE[type] ?? 'neutral';
}
