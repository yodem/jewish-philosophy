"use client";

import { Fragment, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { track } from './analytics';
import { glossLetter, kindLabel, locatorText, safeUrl } from './format';
import { parseAnswer, type Inline } from './markdown';
import type { Citation, FurtherReading, SourceType } from './types';

/**
 * The answer as a page with its glosses (DESIGN.md "Turn = page + margin"): `AnswerText` renders the safe markdown
 * subset with each `[n]` as a Hebrew gloss letter; `Glosses` renders the three groups (ציטוטים / מקורות / להעמקה).
 * Everything is React text: no HTML from the model, the corpus or storage ever becomes markup.
 */

export function glossId(prefix: string, n: number): string {
  return `${prefix}-cite-${n}`;
}

function flash(el: HTMLElement) {
  el.dataset.flash = 'false';
  void el.offsetWidth; // restart the animation on repeated clicks
  el.dataset.flash = 'true';
  window.setTimeout(() => {
    if (el.dataset.flash === 'true') el.dataset.flash = 'false';
  }, 950);
}

function renderInline(nodes: Inline[], prefix: string, byN: Map<number, Citation>): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.t === 'text') return node.v;
    if (node.t === 'bold') return <strong key={i}>{renderInline(node.c, prefix, byN)}</strong>;
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
        onClick={() => {
          const target = document.getElementById(glossId(prefix, node.n));
          if (!target) return;
          target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          target.focus({ preventScroll: true });
          flash(target);
        }}
      >
        {letter}
      </button>
    );
  });
}

export function AnswerText({ text, prefix, citations }: { text: string; prefix: string; citations: Citation[] }) {
  const byN = new Map(citations.map((c) => [c.n, c]));
  return (
    <div data-answer className="sc-answer">
      {parseAnswer(text).map((block, i) =>
        block.t === 'ul' ? (
          <ul key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item, prefix, byN)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {block.lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(line, prefix, byN)}
              </Fragment>
            ))}
          </p>
        ),
      )}
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

function Locator({ label }: { label?: string | null }) {
  const text = locatorText(label);
  return text ? (
    <span className="sc-loc" data-locator>
      <bdi dir="ltr">{text}</bdi>
    </span>
  ) : null;
}

function speakerKind(c: Citation): string {
  if (c.speaker === 'maimonides') return 'הרמב״ם';
  if (c.speaker === 'visitor') return `${kindLabel(c.source_type)} של גולש`;
  return kindLabel(c.source_type);
}

type OpenBy = 'hover' | 'focus' | 'click';

/**
 * A source title that opens a preview of the source text: hover with a mouse, keyboard focus, or a tap/click
 * (which pins it). The preview holds the only outbound link. Esc or a click outside closes it.
 */
function SourceButton({ item, group, label }: { item: PreviewItem; group: Group; label: string }) {
  const [openBy, setOpenBy] = useState<OpenBy | null>(null);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const id = useId();
  const href = safeUrl(item.url);

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

  return (
    <span
      ref={wrapRef}
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
      <Locator label={item.locator_label} />
      {openBy && (
        <span id={id} role="dialog" aria-label={`תצוגה מקדימה: ${item.title}`} className="sc-preview" data-preview onPointerEnter={cancelClose}>
          <span className="sc-preview-head">
            <span className="sc-kind">{label}</span>
            <span className="sc-preview-title">{item.title}</span>
          </span>
          {item.snippet ? (
            <span className="sc-preview-text" style={{ display: 'block' }}>
              {item.snippet}
            </span>
          ) : (
            <span className="sc-preview-empty" style={{ display: 'block' }}>
              אין תצוגה מקדימה למקור הזה.
            </span>
          )}
          <span className="sc-preview-foot">
            {href ? (
              <a
                className="sc-link"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('source_click', { group, source_type: item.source_type })}
              >
                לפתיחת המקור
              </a>
            ) : (
              <span className="sc-preview-empty">אין קישור למקור</span>
            )}
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
                <span className="sc-gloss-mark" aria-hidden>
                  {glossLetter(c.n)}
                </span>
                <blockquote className="sc-quote">״{c.quote}״</blockquote>
                <span className="sc-kind">{speakerKind(c)}</span>
                <SourceButton item={c} group="quote" label={speakerKind(c)} />
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
                <span className="sc-gloss-mark" aria-hidden>
                  {glossLetter(c.n)}
                </span>
                <span className="sc-kind">{speakerKind(c)}</span>
                <SourceButton item={c} group="source" label={speakerKind(c)} />
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
                <span className="sc-kind">{kindLabel(f.source_type)}</span>
                <SourceButton item={f} group="further" label={kindLabel(f.source_type)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
