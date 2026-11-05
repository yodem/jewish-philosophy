import { safeUrl } from './format';
import type { BotMessage, ChatMessage } from './types';

/** Client-side export of the open conversation: Markdown for reading, JSON for keeping. Built from loaded data only. */

export const EXPORT_BASENAME = 'sadik-conversation';
const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';

function answered(messages: ChatMessage[]): { question: string; answer: BotMessage }[] {
  const out: { question: string; answer: BotMessage }[] = [];
  for (let i = 0; i < messages.length - 1; i++) {
    const q = messages[i];
    const a = messages[i + 1];
    if (q.role === 'user' && a.role === 'bot' && !a.error && !a.quota && a.text) out.push({ question: q.text, answer: a });
  }
  return out;
}

const link = (title: string, url: string) => {
  const href = safeUrl(url);
  const clean = title.replace(/[[\]]/g, '');
  return href ? `[${clean}](${href.startsWith('/') ? `https://religousphilosophy.com${href}` : href})` : clean;
};

export function toMarkdown(title: string, messages: ChatMessage[], date = new Date()): string {
  const lines = [`# ${title || 'שיחה עם פרופ׳ צדיק (AI)'}`, '', `> ${DISCLOSURE}`, '', `יוצא ב־${date.toISOString().slice(0, 10)}`, ''];
  for (const { question, answer } of answered(messages)) {
    lines.push(`## ${question.replace(/\s+/g, ' ').trim()}`, '', answer.text.trim(), '');
    const quotes = answer.citations.filter((c) => c.quote);
    const refs = answer.citations.filter((c) => !c.quote);
    if (quotes.length) {
      lines.push('### ציטוטים', '');
      for (const c of quotes) lines.push(`- [${c.n}] ״${c.quote}״ — ${link(c.title, c.url)}${c.locator_label ? ` (${c.locator_label})` : ''}`);
      lines.push('');
    }
    if (refs.length) {
      lines.push('### מקורות', '');
      for (const c of refs) lines.push(`- [${c.n}] ${link(c.title, c.url)}${c.locator_label ? ` (${c.locator_label})` : ''}`);
      lines.push('');
    }
    if (answer.further_reading?.length) {
      lines.push('### להעמקה', '');
      for (const f of answer.further_reading) lines.push(`- ${link(f.title, f.url)}${f.locator_label ? ` (${f.locator_label})` : ''}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

export function toJson(title: string, messages: ChatMessage[], date = new Date()): string {
  return JSON.stringify(
    {
      title,
      exported_at: date.toISOString(),
      disclosure: DISCLOSURE,
      turns: answered(messages).map(({ question, answer }) => ({
        question,
        answer: answer.text,
        citations: answer.citations.map((c) => ({
          n: c.n,
          title: c.title,
          url: safeUrl(c.url),
          source_type: c.source_type,
          kind: c.kind ?? (c.quote ? 'quote' : 'reference'),
          quote: c.quote,
          locator_label: c.locator_label ?? null,
        })),
        further_reading: (answer.further_reading ?? []).map((f) => ({
          title: f.title,
          url: safeUrl(f.url),
          source_type: f.source_type,
          locator_label: f.locator_label,
        })),
      })),
    },
    null,
    2,
  );
}

/** Saves `content` as a file with a fixed name (never derived from user text). */
export function download(format: 'md' | 'json', content: string): void {
  const type = format === 'md' ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8';
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${EXPORT_BASENAME}.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function hasExportable(messages: ChatMessage[]): boolean {
  return answered(messages).length > 0;
}
