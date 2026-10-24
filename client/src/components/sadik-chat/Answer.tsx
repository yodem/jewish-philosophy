"use client";

import { Fragment, memo, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { BookOpen, ExternalLink, Library, Quote, X } from 'lucide-react';
import { track } from './analytics';
import { kindLabel, kindTone, locatorText, safeUrl } from './format';
import { parseAnswer, type Inline } from './markdown';
import type { Citation, FurtherReading, SourceType } from './types';

/**
 * The answer body and its sources, in the site's design system (DESIGN.md): numbered markers in the text link to a
 * clean list of sources inside the answer card (ציטוטים / מקורות / להעמקה) with the site's content-type pills; a
 * source name unfolds its preview in place. Everything is React text: no HTML from the model, the corpus or storage
 * ever becomes markup.
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
  }, 1050);
}

function speakerKind(c: Citation): string {
  if (c.speaker === 'maimonides') return 'הרמב״ם';
  if (c.speaker === 'visitor') return `${kindLabel(c.source_type)} של גולש`;
  return kindLabel(c.source_type);
}

export function KindPill({ type, label }: { type: SourceType; label?: string }) {
  return (
    <span className="sc-pill" data-tone={kindTone(type)} data-kind>
      {label ?? kindLabel(type)}
    </span>
  );
}

function Locator({ label }: { label?: string | null }) {
  const text = locatorText(label);
  return text ? (
    <span className="sc-loc" data-locator>
      <bdi dir="ltr">{text}</bdi>
    </span>
  ) : null;
}

type Group = 'quote' | 'source' | 'further';

function OpenLink({ url, group, type }: { url: string; group: Group; type: SourceType }) {
  const href = safeUrl(url);
  return href ? (
    <a className="sc-link" href={href} target="_blank" rel="noopener noreferrer" onClick={() => track('source_click', { group, source_type: type })}>
      לפתיחת המקור
      <ExternalLink aria-hidden />
    </a>
  ) : (
    <span className="sc-preview-empty" style={{ margin: 0 }}>
      אין קישור למקור
    </span>
  );
}

function renderInline(nodes: Inline[], prefix: string, byN: Map<number, Citation>): ReactNode[] {
  return nodes.map((node, i) => {
    if (node.t === 'text') return node.v;
    if (node.t === 'bold') return <strong key={i}>{renderInline(node.c, prefix, byN)}</strong>;
    const cite = byN.get(node.n);
    if (!cite) {
      return (
        <sup key={i} className="sc-mark" data-marker={node.n}>
          {node.n}
        </sup>
      );
    }
    return (
      <button
        key={i}
        type="button"
        className="sc-mark"
        data-cite-marker={node.n}
        aria-label={`מקור ${node.n}: ${cite.title}`}
        onClick={() => {
          const target = document.getElementById(glossId(prefix, node.n));
          if (!target) return;
          target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          target.focus({ preventScroll: true });
          flash(target);
        }}
      >
        {node.n}
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

interface PreviewItem {
  title: string;
  url: string;
  source_type: SourceType;
  locator_label?: string | null;
  snippet?: string;
}

/**
 * One source entry. Its name is a button that unfolds the preview in place under the entry (pushing the next entries
 * down, never a layer over the list); the close button or Esc folds it. The preview holds the only outbound link.
 */
function Entry({
  item,
  group,
  label,
  n,
  prefix,
  quote,
}: {
  item: PreviewItem;
  group: Group;
  label: string;
  n?: number;
  prefix: string;
  quote?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);

  return (
    <li
      id={n !== undefined ? glossId(prefix, n) : undefined}
      tabIndex={n !== undefined ? -1 : undefined}
      className={`sc-item${n === undefined ? ' sc-item--further' : ''}`}
      data-source-type={item.source_type}
      data-n={n}
    >
      {n !== undefined && (
        <span className="sc-num" aria-hidden>
          {n}
        </span>
      )}
      <div className="sc-item-body">
        {quote && <blockquote className="sc-quote">״{quote}״</blockquote>}
        <div className="sc-item-line">
          <KindPill type={item.source_type} label={label} />
          <button ref={buttonRef} type="button" className="sc-src" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen((v) => !v)}>
            {item.title}
          </button>
          <Locator label={item.locator_label} />
        </div>
        {open && (
          <div id={id} role="region" aria-label={`תצוגה מקדימה: ${item.title}`} className="sc-preview" data-preview>
            <div className="sc-preview-head">
              <span>תצוגה מקדימה</span>
              <button
                type="button"
                className="sc-btn sc-btn--icon sc-preview-close"
                aria-label="סגירת התצוגה המקדימה"
                title="סגירה"
                onClick={() => {
                  setOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                <X aria-hidden />
              </button>
            </div>
            {item.snippet ? <p className="sc-preview-text">{item.snippet}</p> : <p className="sc-preview-empty">אין תצוגה מקדימה למקור הזה.</p>}
            <div className="sc-preview-foot">
              <OpenLink url={item.url} group={group} type={item.source_type} />
              <Locator label={item.locator_label} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
}

export function Glosses({ citations, further, prefix }: { citations: Citation[]; further: FurtherReading[]; prefix: string }) {
  const quotes = citations.filter((c) => c.quote);
  const refs = citations.filter((c) => !c.quote);
  if (!quotes.length && !refs.length && !further.length) return null;
  return (
    <div className="sc-sources" data-sources>
      {quotes.length > 0 && (
        <section data-group="quotes" aria-labelledby={`${prefix}-gq`}>
          <h4 id={`${prefix}-gq`} className="sc-group-name">
            <Quote aria-hidden />
            ציטוטים
          </h4>
          <ol className="sc-list">
            {quotes.map((c) => (
              <Entry key={c.n} item={c} group="quote" label={speakerKind(c)} n={c.n} prefix={prefix} quote={c.quote} />
            ))}
          </ol>
        </section>
      )}
      {refs.length > 0 && (
        <section data-group="sources" aria-labelledby={`${prefix}-gs`}>
          <h4 id={`${prefix}-gs`} className="sc-group-name">
            <BookOpen aria-hidden />
            מקורות
          </h4>
          <ol className="sc-list">
            {refs.map((c) => (
              <Entry key={c.n} item={c} group="source" label={speakerKind(c)} n={c.n} prefix={prefix} />
            ))}
          </ol>
        </section>
      )}
      {further.length > 0 && (
        <section data-group="further" data-further-reading aria-labelledby={`${prefix}-gf`}>
          <h4 id={`${prefix}-gf`} className="sc-group-name">
            <Library aria-hidden />
            להעמקה
          </h4>
          <ul className="sc-list">
            {further.map((f, i) => (
              <Entry key={i} item={f} group="further" label={kindLabel(f.source_type)} prefix={prefix} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * A finished answer (text + sources). Memoised: once the Sefaria linker has rewritten its text nodes, React must not
 * re-render it, so it only re-renders if the answer itself changes (votes and share state live outside it).
 */
export const FinalAnswer = memo(function FinalAnswer({
  text,
  citations,
  further,
  prefix,
}: {
  text: string;
  citations: Citation[];
  further: FurtherReading[];
  prefix: string;
}) {
  return (
    <>
      <AnswerText text={text} prefix={prefix} citations={citations} />
      <Glosses citations={citations} further={further} prefix={prefix} />
    </>
  );
});
