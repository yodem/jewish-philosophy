"use client";

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { track } from './analytics';
import { glossLetter, kindLabel, locatorText, safeUrl } from './format';
import { parseAnswer, type Block, type Inline } from './markdown';
import type { Citation, FurtherReading, SourceType } from './types';

/**
 * The answer as a page with its commentary (DESIGN.md "Turn = page + commentary"): `AnswerText` renders the safe
 * markdown subset with each `[n]` as a Hebrew gloss letter, an enlarged opening word, and (in a narrow conversation
 * area) a gloss strip under each paragraph; `Glosses` renders the commentary column (ציטוטים / מקורות / להעמקה).
 * Everything is React text: no HTML from the model, the corpus or storage ever becomes markup.
 */

export function glossId(prefix: string, n: number): string {
  return `${prefix}-cite-${n}`;
}

function stripId(prefix: string, block: number, n: number): string {
  return `${prefix}-strip-${block}-${n}`;
}

function flash(el: HTMLElement) {
  el.dataset.flash = 'false';
  void el.offsetWidth; // restart the animation on repeated clicks
  el.dataset.flash = 'true';
  window.setTimeout(() => {
    if (el.dataset.flash === 'true') el.dataset.flash = 'false';
  }, 950);
}

function speakerKind(c: Citation): string {
  if (c.speaker === 'maimonides') return 'הרמב״ם';
  if (c.speaker === 'visitor') return `${kindLabel(c.source_type)} של גולש`;
  return kindLabel(c.source_type);
}

function Locator({ label }: { label?: string | null }) {
  const text = locatorText(label);
  return text ? (
    <span className="sc-loc" data-locator>
      <bdi dir="ltr">{text}</bdi>
    </span>
  ) : null;
}

function OpenLink({ url, group, type }: { url: string; group: Group; type: SourceType }) {
  const href = safeUrl(url);
  return href ? (
    <a className="sc-link" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('source_click', { group, source_type: type })}>
      לפתיחת המקור
    </a>
  ) : (
    <span className="sc-preview-empty" style={{ margin: 0 }}>
      אין קישור למקור
    </span>
  );
}

/** Cited numbers in a block, in order of first appearance. */
function citedIn(block: Block): number[] {
  const out: number[] = [];
  const walk = (nodes: Inline[]) => {
    for (const n of nodes) {
      if (n.t === 'cite' && !out.includes(n.n)) out.push(n.n);
      else if (n.t === 'bold') walk(n.c);
    }
  };
  if (block.t === 'p') block.lines.forEach(walk);
  else block.items.forEach(walk);
  return out;
}

/** Wraps the first word of the answer as the page's opening word. */
function withOpening(nodes: Inline[]): (Inline | { t: 'opening'; v: string })[] {
  const [first, ...rest] = nodes;
  if (!first || first.t !== 'text') return nodes;
  const m = /^(\s*\S+)([\s\S]*)$/.exec(first.v);
  if (!m) return nodes;
  return [{ t: 'opening', v: m[1] }, ...(m[2] ? [{ t: 'text' as const, v: m[2] }] : []), ...rest];
}

export function AnswerText({ text, prefix, citations }: { text: string; prefix: string; citations: Citation[] }) {
  const byN = new Map(citations.map((c) => [c.n, c]));
  const [open, setOpen] = useState<string | null>(null);
  const blocks = parseAnswer(text);

  const goTo = (block: number, n: number) => {
    const margin = document.getElementById(glossId(prefix, n));
    if (margin && margin.offsetParent !== null) {
      margin.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      margin.focus({ preventScroll: true });
      flash(margin);
      return;
    }
    // narrow area: unfold the gloss in the strip under this paragraph
    const key = `${block}-${n}`;
    setOpen(key);
    window.requestAnimationFrame(() => {
      const body = document.getElementById(stripId(prefix, block, n));
      if (!body) return;
      body.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      body.focus({ preventScroll: true });
      flash(body);
    });
  };

  const renderInline = (nodes: (Inline | { t: 'opening'; v: string })[], block: number): ReactNode[] =>
    nodes.map((node, i) => {
      if (node.t === 'text') return node.v;
      if (node.t === 'opening') {
        return (
          <span key={i} className="sc-opening">
            {node.v}
          </span>
        );
      }
      if (node.t === 'bold') return <strong key={i}>{renderInline(node.c, block)}</strong>;
      const letter = glossLetter(node.n);
      const cite = byN.get(node.n);
      if (!cite) {
        return (
          <sup key={i} className="sc-mark" data-marker={node.n}>
            {letter}
          </sup>
        );
      }
      return (
        <button
          key={i}
          type="button"
          className="sc-mark"
          data-cite-marker={node.n}
          aria-label={`הערה ${letter}: ${cite.title}`}
          onClick={() => goTo(block, node.n)}
        >
          {letter}
        </button>
      );
    });

  return (
    <div data-answer className="sc-answer">
      {blocks.map((block, i) => {
        const cited = citedIn(block).filter((n) => byN.has(n));
        return (
          <Fragment key={i}>
            {block.t === 'ul' ? (
              <ul>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item, i)}</li>
                ))}
              </ul>
            ) : (
              <p>
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {renderInline(i === 0 && j === 0 ? withOpening(line) : line, i)}
                  </Fragment>
                ))}
              </p>
            )}
            {cited.length > 0 && (
              <GlossStrip
                items={cited.map((n) => byN.get(n)!)}
                block={i}
                prefix={prefix}
                open={open}
                onToggle={(key) => setOpen((v) => (v === key ? null : key))}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

/** The phone form of the commentary: the paragraph's letters with short names; tap unfolds the gloss in place. */
function GlossStrip({
  items,
  block,
  prefix,
  open,
  onToggle,
}: {
  items: Citation[];
  block: number;
  prefix: string;
  open: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="sc-strip" data-strip aria-label="מקורות הפסקה">
      <ul className="sc-strip-list">
        {items.map((c) => {
          const key = `${block}-${c.n}`;
          const expanded = open === key;
          const bodyId = stripId(prefix, block, c.n);
          return (
            <li key={c.n} data-strip-n={c.n}>
              <button type="button" className="sc-strip-item" aria-expanded={expanded} aria-controls={bodyId} onClick={() => onToggle(key)}>
                <span className="sc-letter" aria-hidden>
                  {glossLetter(c.n)}
                </span>
                <span className="sc-strip-name">{c.title}</span>
                <span className="sc-kind">{speakerKind(c)}</span>
              </button>
              {expanded && (
                <div id={bodyId} tabIndex={-1} className="sc-strip-body" data-strip-body>
                  {c.quote ? (
                    <blockquote className="sc-quote">״{c.quote}״</blockquote>
                  ) : c.snippet ? (
                    <p className="sc-preview-text">{c.snippet}</p>
                  ) : (
                    <p className="sc-preview-empty">אין תצוגה מקדימה למקור הזה.</p>
                  )}
                  <span className="sc-preview-foot">
                    <OpenLink url={c.url} group={c.quote ? 'quote' : 'source'} type={c.source_type} />
                    <Locator label={c.locator_label} />
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type Group = 'quote' | 'source' | 'further';

interface PreviewItem {
  title: string;
  url: string;
  source_type: SourceType;
  locator_label?: string | null;
  snippet?: string;
}

type OpenBy = 'hover' | 'focus' | 'click';

/**
 * A source name (the gloss's lemma) that opens a preview of the source text: hover with a mouse, keyboard focus, or
 * a tap/click (which pins it). It opens below the name, or above when the conversation area has no room below, and
 * never taller than the room it has. In a narrow area it unfolds in place. The preview holds the only outbound link.
 */
function SourceButton({ item, group, label }: { item: PreviewItem; group: Group; label: string }) {
  const [openBy, setOpenBy] = useState<OpenBy | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const previewRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const id = useId();

  const cancelClose = () => window.clearTimeout(closeTimer.current);
  const close = useCallback(() => setOpenBy(null), []);

  useEffect(() => {
    if (!openBy) return;
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
        wrapRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [openBy, close]);

  // Collision handling: flip above when the room below (inside the scrolling conversation area) is short.
  useLayoutEffect(() => {
    const pv = previewRef.current;
    const anchor = wrapRef.current;
    if (!openBy || !pv || !anchor || getComputedStyle(pv).position !== 'absolute') return;
    const area = anchor.closest('.sc-scroll')?.getBoundingClientRect() ?? { top: 0, bottom: window.innerHeight };
    const a = anchor.getBoundingClientRect();
    const below = area.bottom - a.bottom - 12;
    const above = a.top - area.top - 12;
    const need = pv.scrollHeight;
    const side = need > below && above > below ? 'top' : 'bottom';
    pv.dataset.side = side;
    pv.style.setProperty('--sc-preview-max', `${Math.max(140, side === 'top' ? above : below)}px`);
  }, [openBy]);

  return (
    <span
      ref={wrapRef}
      className="sc-preview-anchor"
      onPointerEnter={(e) => {
        if (e.pointerType !== 'mouse') return;
        cancelClose();
        setOpenBy((v) => v ?? 'hover');
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== 'mouse') return;
        closeTimer.current = window.setTimeout(() => setOpenBy((v) => (v === 'hover' ? null : v)), 180);
      }}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpenBy((v) => (v === 'focus' ? null : v));
      }}
    >
      <button
        type="button"
        className="sc-src"
        aria-expanded={!!openBy}
        aria-controls={openBy ? id : undefined}
        onFocus={(e) => {
          if (e.currentTarget.matches(':focus-visible')) setOpenBy((v) => v ?? 'focus');
        }}
        onClick={() => setOpenBy((v) => (v === 'click' ? null : 'click'))}
      >
        {item.title}
      </button>
      {openBy && (
        <span ref={previewRef} id={id} role="dialog" aria-label={`תצוגה מקדימה: ${item.title}`} className="sc-preview" data-preview onPointerEnter={cancelClose}>
          <span className="sc-preview-head">
            <span className="sc-kind">{label}</span>
            <span className="sc-preview-title">{item.title}</span>
          </span>
          {item.snippet ? <span className="sc-preview-text">{item.snippet}</span> : <span className="sc-preview-empty">אין תצוגה מקדימה למקור הזה.</span>}
          <span className="sc-preview-foot">
            <OpenLink url={item.url} group={group} type={item.source_type} />
            <Locator label={item.locator_label} />
          </span>
        </span>
      )}
    </span>
  );
}

export function Glosses({ citations, further, prefix }: { citations: Citation[]; further: FurtherReading[]; prefix: string }) {
  const quotes = citations.filter((c) => c.quote);
  const refs = citations.filter((c) => !c.quote);
  if (!quotes.length && !refs.length && !further.length) return null;
  return (
    <>
      {quotes.length > 0 && (
        <section data-group="quotes" aria-labelledby={`${prefix}-gq`}>
          <h4 id={`${prefix}-gq`} className="sc-group-name">
            ציטוטים
          </h4>
          <ol className="sc-glosses">
            {quotes.map((c) => (
              <li key={c.n} id={glossId(prefix, c.n)} tabIndex={-1} className="sc-gloss" data-source-type={c.source_type} data-n={c.n}>
                <span className="sc-gloss-mark sc-letter" aria-hidden>
                  {glossLetter(c.n)}
                </span>
                <SourceButton item={c} group="quote" label={speakerKind(c)} />
                <blockquote className="sc-quote">״{c.quote}״</blockquote>
                <span className="sc-gloss-meta">
                  <span className="sc-kind">{speakerKind(c)}</span>
                  <Locator label={c.locator_label} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {refs.length > 0 && (
        <section data-group="sources" aria-labelledby={`${prefix}-gs`}>
          <h4 id={`${prefix}-gs`} className="sc-group-name">
            מקורות
          </h4>
          <ol className="sc-glosses">
            {refs.map((c) => (
              <li key={c.n} id={glossId(prefix, c.n)} tabIndex={-1} className="sc-gloss" data-source-type={c.source_type} data-n={c.n}>
                <span className="sc-gloss-mark sc-letter" aria-hidden>
                  {glossLetter(c.n)}
                </span>
                <SourceButton item={c} group="source" label={speakerKind(c)} />
                <span className="sc-gloss-meta">
                  <span className="sc-kind">{speakerKind(c)}</span>
                  <Locator label={c.locator_label} />
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {further.length > 0 && (
        <section data-group="further" data-further-reading aria-labelledby={`${prefix}-gf`}>
          <h4 id={`${prefix}-gf`} className="sc-group-name">
            להעמקה
          </h4>
          <ul className="sc-glosses">
            {further.map((f, i) => (
              <li key={i} className="sc-gloss sc-gloss--further" data-source-type={f.source_type}>
                <SourceButton item={f} group="further" label={kindLabel(f.source_type)} />
                <span className="sc-gloss-meta">
                  <span className="sc-kind">{kindLabel(f.source_type)}</span>
                  <Locator label={f.locator_label} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
