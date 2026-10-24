"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Download, Info, LogIn, LogOut, Menu, Moon, MoreHorizontal, Plus, Sun, X } from 'lucide-react';
import { chatFontClasses } from './fonts';
import { hasExportable } from './export';
import { STARTERS } from './starters';
import { Turn } from './Turn';
import { useSadikChat } from './useSadikChat';
import type { BotMessage, ChatMessage } from './types';
import './sadik-chat.css';

const TITLE = 'שאלו את פרופ׳ צדיק';
const DIALOG_LABEL = 'שאלו את פרופ׳ צדיק (AI)';
const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';

/** Pairs each question with the answer after it. */
function toTurns(messages: ChatMessage[]): { question: string; answer?: BotMessage; index: number }[] {
  const out: { question: string; answer?: BotMessage; index: number }[] = [];
  messages.forEach((m, i) => {
    if (m.role === 'user') out.push({ question: m.text, index: i + 1 });
    else if (out.length && !out[out.length - 1].answer) out[out.length - 1].answer = m;
  });
  return out;
}

/** A header popover (info, export) that closes on Esc or a click outside. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open, close, ref]);
}

function Popover({ label, icon, wideLabel, children, menu, testId, className }: { label: string; icon: ReactNode; wideLabel?: boolean; children: ReactNode; menu?: boolean; testId: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, close, ref);
  return (
    <div ref={ref} className={`sc-pop-anchor${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className={`sc-btn${wideLabel ? '' : ' sc-btn--icon'}`}
        aria-expanded={open}
        aria-label={label}
        title={label}
        data-testid={testId}
        onClick={() => setOpen((v) => !v)}
      >
        {icon}
        {wideLabel && <span className="sc-label-wide">{label}</span>}
      </button>
      {open && !menu && <div className="sc-pop-backdrop" onClick={close} aria-hidden />}
      {open && (
        <div className={`sc-pop${menu ? ' sc-pop--menu' : ''}`} role={menu ? 'menu' : 'dialog'} aria-label={label} onClick={menu ? close : undefined}>
          {!menu && (
            <div className="sc-pop-close">
              <button type="button" className="sc-btn sc-btn--icon" aria-label="סגירה" title="סגירה" onClick={close}>
                <X aria-hidden />
              </button>
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function useDarkTheme(): [boolean, () => void] {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  const toggle = useCallback(() => {
    // The site's own theme setting: the chat and the page never disagree.
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // theme still applies for this page view
    }
    setDark(next);
  }, []);
  return [dark, toggle];
}

function ThemeToggle({ withText }: { withText?: boolean }) {
  const [dark, toggle] = useDarkTheme();
  const label = dark ? 'מעבר למצב בהיר' : 'מעבר למצב כהה';
  return (
    <button
      type="button"
      className={`sc-btn${withText ? '' : ' sc-btn--icon'}`}
      role={withText ? 'menuitem' : undefined}
      aria-label={withText ? undefined : label}
      title={label}
      onClick={toggle}
    >
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
      {withText && label}
    </button>
  );
}

export default function SadikChat() {
  const [open, setOpen] = useState(false);
  const [railOpen, setRailOpen] = useState(false);
  const [input, setInput] = useState('');
  const chat = useSadikChat(open);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Follow the newest turn while it is written.
  const lastCount = useRef(0);
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    if (chat.messages.length !== lastCount.current) {
      const turns = el.querySelectorAll('[data-turn]');
      turns[turns.length - 1]?.scrollIntoView({ block: 'start' });
      lastCount.current = chat.messages.length;
    }
  }, [chat.messages, open]);

  const close = useCallback(() => setOpen(false), []);

  function submit(text: string, starterIndex?: number) {
    const t = text.trim();
    if (!t || chat.busy || chat.quotaHit) return;
    setInput('');
    inputRef.current?.focus();
    void chat.send(t, starterIndex === undefined ? {} : { starterIndex });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) {
      inputRef.current?.focus();
      return;
    }
    submit(input);
  }

  // Esc closes the rail drawer, else the panel (popovers and previews handle their own Esc first and mark it handled).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if (railOpen) setRailOpen(false);
      else close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, railOpen, close]);

  const turns = toTurns(chat.messages);
  const signedIn = chat.auth === 'signed_in';
  const empty = turns.length === 0;
  const canExport = hasExportable(chat.messages);
  const startNew = () => {
    chat.newConversation();
    setRailOpen(false);
    inputRef.current?.focus();
  };

  if (!open) {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-24 z-50 rounded-full bg-navbar px-4 py-2.5 text-sm text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
      >
        💬 שאלו את פרופ׳ צדיק
      </button>
    );
  }

  return (
    <>
      <div className="sc sc-scrim" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={DIALOG_LABEL}
        className={`sc sc-panel ${chatFontClasses}`}
        dir="rtl"
        lang="he"
      >
        {signedIn && railOpen && <div className="sc-rail-scrim" onClick={() => setRailOpen(false)} aria-hidden />}
        {signedIn && (
          <nav className="sc-rail" aria-label="שיחות" data-open={railOpen} data-rail>
            <div className="sc-rail-top">
              <button type="button" className="sc-btn sc-btn--outline" onClick={startNew}>
                <Plus aria-hidden />
                שיחה חדשה
              </button>
              <button
                type="button"
                className="sc-btn sc-btn--icon sc-rail-close"
                aria-label="סגירת רשימת השיחות"
                title="סגירת רשימת השיחות"
                onClick={() => setRailOpen(false)}
              >
                <X aria-hidden />
              </button>
            </div>
            <p className="sc-rail-title">השיחות שלכם</p>
            {chat.conversations.length ? (
              <ul className="sc-rail-list">
                {chat.conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="sc-rail-item"
                      aria-current={c.id === chat.conversationId}
                      title={c.title}
                      onClick={() => {
                        void chat.openConversation(c.id);
                        setRailOpen(false);
                      }}
                    >
                      {c.title || 'שיחה ללא כותרת'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sc-rail-empty">עוד אין שיחות שמורות.</p>
            )}
          </nav>
        )}

        <section className="sc-main">
          <header className="sc-head">
            {signedIn && (
              <button
                type="button"
                className="sc-btn sc-btn--icon sc-rail-toggle"
                aria-label="שיחות"
                title="שיחות"
                aria-expanded={railOpen}
                onClick={() => setRailOpen((v) => !v)}
              >
                <Menu aria-hidden />
              </button>
            )}
            <div className="sc-head-title">
              <h2 className="sc-title">{TITLE}</h2>
              <span className="sc-ai-tag">בינה מלאכותית</span>
            </div>
            <div className="sc-tools">
              <Popover label="אודות" icon={<Info aria-hidden />} wideLabel testId="sc-info">
                <p className="sc-disclosure" data-disclosure>
                  {DISCLOSURE}
                </p>
                <p className="sc-info-h">איך נבנות התשובות</p>
                <ul className="sc-info-list">
                  <li>המערכת מחפשת בהרצאות, במאמרים ובתשובות של פרופ׳ צדיק, וכותבת תשובה רק מתוך מה שמצאה.</li>
                  <li>כל טענה מסומנת באות (א, ב, ג), ובשוליים מופיע המקור שלה. ציטוטים נבדקים מול הטקסט המקורי לפני שהם מוצגים.</li>
                  <li>המערכת עלולה לטעות. לפני שמסתמכים על תשובה, כדאי לפתוח את המקור.</li>
                </ul>
                <p className="sc-info-h">מה נשמר</p>
                <ul className="sc-info-list">
                  <li>השאלות והתשובות נשמרות כדי לשפר את המערכת. ללא התחברות, השיחה נשמרת גם בדפדפן שלכם.</li>
                </ul>
              </Popover>
              <div className="sc-wide-only">
                <ThemeToggle />
                {canExport && (
                  <Popover label="ייצוא" icon={<Download aria-hidden />} menu testId="sc-export">
                    <button type="button" role="menuitem" className="sc-btn" onClick={() => chat.exportConversation('md')}>
                      קובץ Markdown ‏(.md)
                    </button>
                    <button type="button" role="menuitem" className="sc-btn" onClick={() => chat.exportConversation('json')}>
                      קובץ JSON ‏(.json)
                    </button>
                  </Popover>
                )}
                {!signedIn && !empty && (
                  <button
                    type="button"
                    className="sc-btn sc-btn--icon"
                    aria-label="שיחה חדשה"
                    title="שיחה חדשה"
                    disabled={chat.busy}
                    onClick={startNew}
                  >
                    <Plus aria-hidden />
                  </button>
                )}
              </div>
              <Popover label="עוד" icon={<MoreHorizontal aria-hidden />} menu testId="sc-more" className="sc-narrow-only">
                <ThemeToggle withText />
                {canExport && (
                  <>
                    <button type="button" role="menuitem" className="sc-btn" onClick={() => chat.exportConversation('md')}>
                      <Download aria-hidden />
                      ייצוא כקובץ Markdown
                    </button>
                    <button type="button" role="menuitem" className="sc-btn" onClick={() => chat.exportConversation('json')}>
                      <Download aria-hidden />
                      ייצוא כקובץ JSON
                    </button>
                  </>
                )}
                {!signedIn && !empty && (
                  <button type="button" role="menuitem" className="sc-btn" disabled={chat.busy} onClick={startNew}>
                    <Plus aria-hidden />
                    שיחה חדשה
                  </button>
                )}
              </Popover>
              {chat.auth === 'signed_out' && (
                <button type="button" className="sc-btn sc-btn--outline" onClick={chat.signIn} data-sign-in>
                  <LogIn aria-hidden className="sc-label-wide" />
                  <span>התחברות<span className="sc-label-wide"> עם Google</span></span>
                </button>
              )}
              {signedIn && (
                <button type="button" className="sc-btn" onClick={chat.signOut} aria-label="התנתקות" title="התנתקות">
                  <LogOut aria-hidden />
                  <span className="sc-label-wide">התנתקות</span>
                </button>
              )}
              <button type="button" onClick={close} aria-label="סגירה" title="סגירה" className="sc-btn sc-btn--icon">
                <X aria-hidden />
              </button>
            </div>
          </header>

          <div ref={listRef} className="sc-scroll" aria-live="polite" aria-busy={chat.busy || chat.loadingConversation}>
            {empty ? (
              <div className="sc-folio" data-empty>
                <ul className="sc-folio-side sc-folio-side--start" aria-label="שאלות לדוגמה">
                  {STARTERS.slice(0, 3).map((s, i) => (
                    <li key={s.question}>
                      <button type="button" className="sc-starter" data-starter={i} onClick={() => submit(s.question, i)} disabled={chat.quotaHit}>
                        <span className="sc-starter-topic">{s.topic}</span>
                        <span className="sc-starter-q">{s.question}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="sc-folio-main">
                  <h3 className="sc-folio-title">על מה תרצו לשאול?</h3>
                  <p className="sc-folio-lede">
                    התשובות נכתבות מתוך הרצאותיו, מאמריו ותשובותיו של פרופ׳ שלום צדיק. כל טענה מסומנת באות
                    {' '}
                    <span className="sc-letter">א</span>, <span className="sc-letter">ב</span>, <span className="sc-letter">ג</span>
                    {' '}
                    ובשוליים מחכה המקור.
                  </p>
                </div>
                <ul className="sc-folio-side sc-folio-side--end" aria-label="עוד שאלות לדוגמה">
                  {STARTERS.slice(3).map((s, j) => (
                    <li key={s.question}>
                      <button type="button" className="sc-starter" data-starter={j + 3} onClick={() => submit(s.question, j + 3)} disabled={chat.quotaHit}>
                        <span className="sc-starter-topic">{s.topic}</span>
                        <span className="sc-starter-q">{s.question}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              turns.map((t, i) => (
                <Turn
                  key={`${chat.conversationId}-${i}`}
                  question={t.question}
                  answer={t.answer}
                  prefix={`sadik-m${t.index}`}
                  pending={chat.busy && i === turns.length - 1}
                  auth={chat.auth}
                  onVote={(value) => void chat.vote(t.index, value)}
                  onShare={() => chat.share(t.index)}
                  onSignIn={chat.signIn}
                />
              ))
            )}
          </div>

          <form onSubmit={onSubmit} className="sc-composer">
            <div className="sc-composer-inner">
              {chat.quotaHit ? (
                <p className="sc-composer-locked" data-composer-locked>
                  {chat.auth === 'signed_out' ? 'שאלות נוספות היום יתאפשרו אחרי התחברות.' : 'אפשר לשאול שוב מחר.'}
                </p>
              ) : (
                <>
                  <label htmlFor="sc-input">{empty ? 'השאלה שלכם' : 'שאלת המשך באותה שיחה'}</label>
                  <div className="sc-composer-row">
                    <textarea
                      id="sc-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={1}
                      maxLength={2000}
                      placeholder={empty ? 'למשל: מה דעת הרמב״ם על ההשגחה?' : 'למשל: ומה השיב לו קרשקש?'}
                    />
                    <button type="submit" className="sc-btn sc-btn--primary" disabled={chat.busy}>
                      שליחה
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
