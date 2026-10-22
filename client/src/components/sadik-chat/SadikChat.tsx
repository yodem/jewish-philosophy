"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { parseSSE } from './sse';
import type { BotMessage, ChatMessage, Citation, SourceType, Vote } from './types';

const STORAGE_KEY = 'sadik-chat-v1';
const TITLE = 'שאלו את פרופ׳ צדיק (AI)';
const DISCLOSURE = 'בינה מלאכותית שנבנתה מכתביו של פרופ׳ שלום צדיק — לא פרופ׳ צדיק עצמו';
const GENERIC_ERROR = 'אירעה שגיאה. נסו שוב מאוחר יותר.';

// Colours follow DESIGN.md content types; comment shares the responsa colour.
const CHIP: Record<SourceType, { label: string; className: string }> = {
  responsa: { label: 'שו״ת', className: 'bg-orange-700' },
  comment: { label: 'תגובה', className: 'bg-orange-700' },
  writing: { label: 'כתב', className: 'bg-teal-700' },
  blog: { label: 'בלוג', className: 'bg-green-700' },
  term: { label: 'מושג', className: 'bg-pink-700' },
  video: { label: 'וידאו', className: 'bg-blue-700' },
  playlist: { label: 'סדרה', className: 'bg-purple-700' },
  academic: { label: 'אקדמי', className: 'bg-slate-700' },
  primary: { label: 'מקור', className: 'bg-gray-600' },
};

function safeUrl(url: string): string | null {
  return /^(https?:\/\/|\/(?!\/))/.test(url) ? url : null;
}

function isValidMessage(m: unknown): m is ChatMessage {
  if (!m || typeof m !== 'object') return false;
  const { role, text, citations } = m as Record<string, unknown>;
  if (typeof text !== 'string') return false;
  if (role === 'user') return true;
  const { turn_id, vote } = m as Record<string, unknown>;
  return (
    role === 'bot' &&
    (turn_id === undefined || typeof turn_id === 'string') &&
    (vote === undefined || vote === 'up' || vote === 'down') &&
    Array.isArray(citations) &&
    citations.every(
      (c) =>
        c &&
        typeof c === 'object' &&
        typeof (c as Citation).n === 'number' &&
        typeof (c as Citation).title === 'string' &&
        typeof (c as Citation).url === 'string' &&
        typeof (c as Citation).source_type === 'string',
    )
  );
}

function loadTranscript(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidMessage) : [];
  } catch {
    return [];
  }
}

function saveTranscript(messages: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // storage unavailable: chat still works for this page view
  }
}

function AnswerText({ text }: { text: string }) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        /^\[\d+\]$/.test(part) ? (
          <sup key={i} className="font-semibold text-blue-700">
            {part}
          </sup>
        ) : (
          part
        ),
      )}
    </p>
  );
}

function CitationChip({ citation }: { citation: Citation }) {
  const chip = CHIP[citation.source_type] ?? CHIP.primary;
  const href = safeUrl(citation.url);
  const title = (
    <>
      <span className="font-semibold">[{citation.n}]</span> {citation.title}
    </>
  );
  return (
    <li data-source-type={citation.source_type} className="text-[13px] leading-snug text-[#333]">
      <span
        data-chip-label
        className={`${chip.className} me-1.5 inline-block rounded-md px-1.5 py-px text-xs text-white`}
      >
        {chip.label}
      </span>
      {citation.speaker === 'visitor' && (
        <span className="me-1.5 inline-block rounded-md bg-gray-200 px-1.5 py-px text-xs text-[#333]">גולש</span>
      )}
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          {title}
        </a>
      ) : (
        <span>{title}</span>
      )}
      {citation.quote && <q className="mt-0.5 block text-xs text-[#555]">{citation.quote}</q>}
    </li>
  );
}

const THUMBS: { value: Vote; label: string; icon: string }[] = [
  { value: 'up', label: 'תשובה טובה', icon: '👍' },
  { value: 'down', label: 'תשובה לא טובה', icon: '👎' },
];

function Thumbs({ vote, onVote }: { vote?: Vote; onVote: (value: Vote) => void }) {
  return (
    <div className="mt-1.5 flex gap-1">
      {THUMBS.map((t) => (
        <button
          key={t.value}
          type="button"
          aria-label={t.label}
          aria-pressed={vote === t.value}
          disabled={vote !== undefined}
          onClick={() => onVote(t.value)}
          className={`rounded-md px-1.5 py-0.5 text-sm focus-visible:outline-2 focus-visible:outline-blue-500 ${
            vote === t.value ? 'bg-[#e9e4d8]' : vote ? 'opacity-40' : 'hover:bg-[#e9e4d8]'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}

function BotBubble({ message, onVote }: { message: BotMessage; onVote: (value: Vote) => void }) {
  return (
    <div
      role={message.error ? 'alert' : undefined}
      className={`max-w-[92%] rounded-[10px] px-3 py-2 text-sm leading-relaxed text-[#222] ${
        message.error ? 'bg-red-50 text-red-800' : 'bg-[#f5f5f5]'
      }`}
    >
      {message.text ? <AnswerText text={message.text} /> : <span aria-hidden>…</span>}
      {message.citations.length > 0 && (
        <ul className="mt-2 grid gap-1">
          {message.citations.map((c) => (
            <CitationChip key={c.n} citation={c} />
          ))}
        </ul>
      )}
      {message.turn_id && !message.error && <Thumbs vote={message.vote} onVote={onVote} />}
    </div>
  );
}

export default function SadikChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMessages(loadTranscript());
    setHydrated(true);
  }, []);

  // Persist completed turns only: a half-streamed answer is not worth restoring.
  useEffect(() => {
    if (hydrated && !busy) saveTranscript(messages);
  }, [messages, hydrated, busy]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const close = useCallback(() => setOpen(false), []);

  const patchBot = useCallback((patch: (m: BotMessage) => BotMessage) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== 'bot') return prev;
      return [...prev.slice(0, -1), patch(last)];
    });
  }, []);

  // One vote per answer, optimistic: a failed POST puts the buttons back so the vote can be retried.
  async function vote(index: number, value: Vote) {
    const target = messages[index];
    if (!target || target.role !== 'bot' || !target.turn_id || target.vote) return;
    const turnId = target.turn_id;
    const setVote = (v: Vote | undefined) =>
      setMessages((prev) =>
        prev.map((m, i) => {
          if (i !== index || m.role !== 'bot' || m.turn_id !== turnId) return m;
          const { vote: _old, ...rest } = m;
          return v ? { ...rest, vote: v } : rest;
        }),
      );
    setVote(value);
    try {
      const res = await fetch('/api/sadik-chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ turn_id: turnId, value }),
      });
      if (!res.ok) setVote(undefined);
    } catch {
      setVote(undefined);
    }
  }

  async function send(text: string) {
    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'bot', text: '', citations: [] }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let finished = false;
    const fail = (message: string) => {
      finished = true;
      patchBot((m) => ({ ...m, text: message, citations: [], error: true }));
    };
    try {
      const res = await fetch('/api/sadik-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        fail(res.status === 429 ? 'שאלתם הרבה בזמן קצר. נסו שוב בעוד רגע.' : GENERIC_ERROR);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const buf = { rest: '' };
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const ev of parseSSE(decoder.decode(value, { stream: true }), buf)) {
          const data = ev.data as { text?: string; citations?: Citation[]; message?: string; turn_id?: string };
          if (ev.event === 'delta' && typeof data.text === 'string') {
            const chunk = data.text;
            patchBot((m) => ({ ...m, text: m.text + chunk }));
          } else if (ev.event === 'final' && typeof data.text === 'string') {
            finished = true;
            const finalText = data.text;
            const citations = Array.isArray(data.citations) ? data.citations : [];
            const turn_id = typeof data.turn_id === 'string' && data.turn_id ? data.turn_id : undefined;
            patchBot((m) => ({ ...m, text: finalText, citations, turn_id }));
          } else if (ev.event === 'error') {
            fail(typeof data.message === 'string' && data.message ? data.message : GENERIC_ERROR);
          }
        }
      }
      if (!finished) fail(GENERIC_ERROR);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') fail(GENERIC_ERROR);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    void send(text);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      close();
    }
  }

  return (
    <>
      {!open && (
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-24 z-50 rounded-full bg-navbar px-4 py-2.5 text-sm text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          💬 שאלו את פרופ׳ צדיק
        </button>
      )}
      {open && (
        <div
          role="dialog"
          aria-label={TITLE}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-6 sm:left-6 sm:h-[520px] sm:max-h-[calc(100dvh-3rem)] sm:w-[380px] sm:rounded-xl sm:shadow-2xl"
        >
          <div className="flex items-center justify-between bg-navbar px-3 py-2.5 text-white sm:rounded-t-xl">
            <h2 className="text-base font-semibold">{TITLE}</h2>
            <button type="button" onClick={close} aria-label="סגירה" className="px-2 text-lg leading-none">
              ✕
            </button>
          </div>
          <div ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
            {messages.length === 0 && (
              <p className="text-sm text-[#555]">שאלו שאלה בהגות היהודית, ואענה מתוך כתביו של פרופ׳ צדיק.</p>
            )}
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <div key={i} className="max-w-[85%] self-start rounded-[10px] bg-[#e9e4d8] px-3 py-2 text-sm text-[#222]">
                  {m.text}
                </div>
              ) : (
                <BotBubble key={i} message={m} onVote={(value) => void vote(i, value)} />
              ),
            )}
          </div>
          <p className="px-3 pb-1.5 text-xs text-[#555]">{DISCLOSURE}</p>
          <form onSubmit={onSubmit} className="flex gap-2 border-t border-gray-200 p-2">
            <textarea
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
              placeholder="כתבו שאלה…"
              aria-label="שאלה"
              className="flex-1 resize-none rounded-md bg-[#f3f3f3] p-2 text-sm text-[#222] outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="שליחה"
              className="rounded-md bg-navbar px-3 text-white disabled:opacity-50"
            >
              ➤
            </button>
          </form>
        </div>
      )}
    </>
  );
}
