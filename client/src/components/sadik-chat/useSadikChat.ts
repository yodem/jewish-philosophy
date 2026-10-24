"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { signIn as authSignIn, signOut as authSignOut } from 'next-auth/react';
import { track } from './analytics';
import { clearStore, loadStore, newConversationId, saveStore, titleFrom, upsert, type LocalStore } from './conversation';
import { download, toJson, toMarkdown } from './export';
import { parseSSE } from './sse';
import { parseConversationList, parseConversationTurns, parseSseEvent } from './validate';
import type { AuthState, BotMessage, ChatMessage, ConversationSummary, Vote } from './types';

/**
 * The chat's state and behaviour, with no markup: the view components only render what this returns and call its
 * actions. Conversation ids are uuid4 hex, made here; one id = one multi-turn conversation on the bridge.
 */

export const GENERIC_ERROR = 'אירעה שגיאה. נסו שוב מאוחר יותר.';
export const RATE_ERROR = 'שאלתם הרבה בזמן קצר. נסו שוב בעוד רגע.';
export const BUSY_ERROR = 'העומס גבוה כרגע. נסו שוב בעוד דקה.';
export const QUOTA_MESSAGE = 'שאלה אחת ביום ללא התחברות — התחברו כדי להמשיך';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export type ShareResult = { ok: true; url: string } | { ok: false };

export interface SadikChatState {
  auth: AuthState;
  conversationId: string;
  title: string;
  messages: ChatMessage[];
  busy: boolean;
  /** The anonymous daily quota is used up: the composer is locked until sign-in. */
  quotaHit: boolean;
  /** Signed-in conversation list (newest first); empty for anonymous visitors. */
  conversations: ConversationSummary[];
  loadingConversation: boolean;
  send: (text: string, opts?: { starterIndex?: number }) => Promise<void>;
  vote: (index: number, value: Vote) => Promise<void>;
  share: (index: number) => Promise<ShareResult>;
  newConversation: () => void;
  openConversation: (id: string) => Promise<void>;
  exportConversation: (format: 'md' | 'json') => void;
  signIn: () => void;
  signOut: () => void;
}

export function useSadikChat(open: boolean): SadikChatState {
  const [auth, setAuth] = useState<AuthState>('disabled');
  const [store, setStore] = useState<LocalStore>({ current: null, conversations: [] });
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [quotaHit, setQuotaHit] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const storeRef = useRef<LocalStore>(store);

  // Restore the open conversation from localStorage (validated on load).
  useEffect(() => {
    const loaded = loadStore();
    const current = loaded.conversations.find((c) => c.id === loaded.current);
    storeRef.current = loaded;
    setStore(loaded);
    setConversationId(current?.id ?? newConversationId());
    setMessages(current?.messages ?? []);
    setQuotaHit(!!current?.messages.some((m) => m.role === 'bot' && m.quota));
    setHydrated(true);
  }, []);

  // Persist completed turns only: a half-streamed answer is not worth restoring. Saved synchronously in the effect
  // (not inside a state updater), so a reload right after a vote or an answer still finds it.
  useEffect(() => {
    if (!hydrated || busy || !conversationId) return;
    const prev = storeRef.current;
    const next = messages.length
      ? upsert(prev, { id: conversationId, title: titleFrom(messages), messages, updated: Date.now() })
      : { ...prev, current: null };
    storeRef.current = next;
    saveStore(next);
    setStore(next);
  }, [messages, hydrated, busy, conversationId]);

  const refreshConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/sadik-chat/history', { method: 'POST', headers: JSON_HEADERS, body: '{}' });
      if (res.ok) setConversations(parseConversationList(await res.json()));
    } catch {
      // the list is a convenience; the chat still works
    }
  }, []);

  useEffect(() => {
    if (open) track('chat_open');
  }, [open]);

  // Sign-in state, asked on the first open; the conversation list for signed-in users.
  const askedAuth = useRef(false);
  useEffect(() => {
    if (!open || askedAuth.current) return;
    askedAuth.current = true;
    (async () => {
      try {
        const res = await fetch('/api/sadik-chat/me', { cache: 'no-store' });
        const data: unknown = res.ok ? await res.json() : null;
        const state = (data as { auth?: unknown } | null)?.auth;
        if (state === 'signed_in' || state === 'signed_out' || state === 'disabled') {
          setAuth(state);
          if (state === 'signed_in') {
            setQuotaHit(false);
            void refreshConversations();
          }
        }
      } catch {
        // stays "disabled": sign-in is hidden
      }
    })();
  }, [open, refreshConversations]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const patchBot = useCallback((patch: (m: BotMessage) => BotMessage) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.role !== 'bot') return prev;
      return [...prev.slice(0, -1), patch(last)];
    });
  }, []);

  const send = useCallback(
    async (text: string, opts: { starterIndex?: number } = {}) => {
      if (busy || quotaHit) return;
      if (opts.starterIndex !== undefined) track('starter_click', { index: opts.starterIndex });
      const turnIndex = messages.filter((m) => m.role === 'user').length;
      track('message_send', { turn_index: turnIndex });
      setMessages((prev) => [...prev, { role: 'user', text }, { role: 'bot', text: '', citations: [] }]);
      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;
      const started = performance.now();
      let finished = false;
      const fail = (message: string) => {
        finished = true;
        patchBot((m) => ({ ...m, text: message, citations: [], error: true }));
      };
      try {
        const res = await fetch('/api/sadik-chat', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ message: text, conversation_id: conversationId }),
          signal: controller.signal,
        });
        if (res.status === 429) {
          const data: unknown = await res.json().catch(() => null);
          if ((data as { reason?: unknown } | null)?.reason === 'anon_daily_quota') {
            finished = true;
            track('quota_hit');
            setQuotaHit(true);
            patchBot((m) => ({ ...m, text: QUOTA_MESSAGE, citations: [], quota: true }));
            return;
          }
          fail(RATE_ERROR);
          return;
        }
        if (!res.ok || !res.body) {
          fail(res.status === 503 ? BUSY_ERROR : GENERIC_ERROR);
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const buf = { rest: '' };
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const ev of parseSSE(decoder.decode(value, { stream: true }), buf)) {
            const parsed = parseSseEvent(ev);
            if (!parsed) continue;
            if (parsed.kind === 'delta') {
              patchBot((m) => ({ ...m, text: m.text + parsed.text }));
            } else if (parsed.kind === 'final') {
              finished = true;
              const quotes = parsed.citations.filter((c) => c.quote).length;
              track('answer_received', {
                latency_ms: performance.now() - started,
                n_quotes: quotes,
                n_refs: parsed.citations.length - quotes,
                n_further: parsed.further_reading.length,
              });
              patchBot((m) => ({
                ...m,
                text: parsed.text,
                citations: parsed.citations,
                further_reading: parsed.further_reading,
                turn_id: parsed.turn_id,
              }));
            } else {
              fail(parsed.kind === 'error' && parsed.message ? parsed.message : GENERIC_ERROR);
              void reader.cancel().catch(() => {});
              return;
            }
          }
        }
        if (!finished) fail(GENERIC_ERROR);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') fail(GENERIC_ERROR);
      } finally {
        setBusy(false);
        if (auth === 'signed_in') void refreshConversations();
      }
    },
    [busy, quotaHit, messages, conversationId, patchBot, auth, refreshConversations],
  );

  // One vote per answer, optimistic: a failed POST puts the buttons back so the vote can be retried.
  const vote = useCallback(
    async (index: number, value: Vote) => {
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
          headers: JSON_HEADERS,
          body: JSON.stringify({ turn_id: turnId, value }),
        });
        if (!res.ok) setVote(undefined);
        else track('feedback', { value });
      } catch {
        setVote(undefined);
      }
    },
    [messages],
  );

  const share = useCallback(
    async (index: number): Promise<ShareResult> => {
      const target = messages[index];
      if (!target || target.role !== 'bot' || !target.turn_id) return { ok: false };
      try {
        const res = await fetch('/api/sadik-chat/share', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ turn_id: target.turn_id }),
        });
        if (!res.ok) return { ok: false };
        const { id } = (await res.json()) as { id?: unknown };
        if (typeof id !== 'string' || !/^[\w-]{16,64}$/.test(id)) return { ok: false };
        track('share', { stage: 'create' });
        return { ok: true, url: `${window.location.origin}/sadik/share/${id}` };
      } catch {
        return { ok: false };
      }
    },
    [messages],
  );

  const newConversation = useCallback(() => {
    abortRef.current?.abort();
    track('new_conversation');
    setConversationId(newConversationId());
    setMessages([]);
  }, []);

  const openConversation = useCallback(
    async (id: string) => {
      if (busy || id === conversationId) return;
      const local = store.conversations.find((c) => c.id === id);
      if (auth !== 'signed_in') {
        if (local) {
          setConversationId(local.id);
          setMessages(local.messages);
        }
        return;
      }
      setLoadingConversation(true);
      try {
        const res = await fetch('/api/sadik-chat/history/conversation', {
          method: 'POST',
          headers: JSON_HEADERS,
          body: JSON.stringify({ conversation_id: id }),
        });
        if (!res.ok) return;
        const turns = parseConversationTurns(await res.json());
        setConversationId(id);
        setMessages(turns);
      } catch {
        // stays on the current conversation
      } finally {
        setLoadingConversation(false);
      }
    },
    [busy, conversationId, store.conversations, auth],
  );

  const title = titleFrom(messages);

  const exportConversation = useCallback(
    (format: 'md' | 'json') => {
      download(format, format === 'md' ? toMarkdown(title, messages) : toJson(title, messages));
      track('export', { format });
    },
    [title, messages],
  );

  // Google sign-in through Auth.js (POST with its CSRF token); back to this page afterwards (same-origin path only).
  const signIn = useCallback(() => {
    track('sign_in');
    void authSignIn('google', { redirectTo: window.location.pathname });
  }, []);

  // Sign-out also clears the conversations kept in this browser.
  const signOut = useCallback(() => {
    clearStore();
    void authSignOut({ redirectTo: window.location.pathname });
  }, []);

  return {
    auth,
    conversationId,
    title,
    messages,
    busy,
    quotaHit,
    conversations,
    loadingConversation,
    send,
    vote,
    share,
    newConversation,
    openConversation,
    exportConversation,
    signIn,
    signOut,
  };
}
