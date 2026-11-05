/**
 * Minimal, safe markdown for chat answers. Parses text into a small tree (never HTML): the renderer builds React
 * elements from it, so nothing in the answer can become markup.
 * Supported: `**bold**`, blank-line paragraphs, single line breaks, `- ` bullet lists, and `[n]` citation markers.
 * Everything else (other markdown, HTML tags, links) stays literal text.
 */
export type Inline = { t: 'text'; v: string } | { t: 'bold'; c: Inline[] } | { t: 'cite'; n: number; raw: string };
export type Block = { t: 'p'; lines: Inline[][] } | { t: 'ul'; items: Inline[][] };

const BOLD = /\*\*(\S(?:.*?\S)?)\*\*/g;
const CITE = /(\[\d+\])/;
const BULLET = /^ {0,3}-[ \t]+(\S.*)$/;

function withCites(text: string): Inline[] {
  return text
    .split(CITE)
    .filter((s) => s !== '')
    .map((s): Inline => (/^\[\d+\]$/.test(s) ? { t: 'cite', n: Number(s.slice(1, -1)), raw: s } : { t: 'text', v: s }));
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(BOLD)) {
    out.push(...withCites(text.slice(last, m.index)));
    out.push({ t: 'bold', c: withCites(m[1]) });
    last = m.index + m[0].length;
  }
  out.push(...withCites(text.slice(last)));
  return out;
}

export function parseAnswer(text: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (const raw of text.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      cur = null;
      continue;
    }
    const bullet = BULLET.exec(line);
    if (bullet) {
      if (cur?.t !== 'ul') blocks.push((cur = { t: 'ul', items: [] }));
      cur.items.push(parseInline(bullet[1]));
    } else {
      if (cur?.t !== 'p') blocks.push((cur = { t: 'p', lines: [] }));
      cur.lines.push(parseInline(line.trim()));
    }
  }
  return blocks;
}
