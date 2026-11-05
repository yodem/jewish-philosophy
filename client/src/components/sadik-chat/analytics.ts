"use client";

import { SOURCE_TYPES } from './validate';

/**
 * GA4 events for the chat. Only event names and numeric or enum parameters leave the page: never message text,
 * titles, user / conversation / turn / share ids or URLs. Each event has a fixed parameter schema; anything else is dropped.
 */
export type ChatEvent =
  | 'chat_open'
  | 'message_send'
  | 'answer_received'
  | 'quota_hit'
  | 'sign_in'
  | 'feedback'
  | 'export'
  | 'share'
  | 'source_click'
  | 'starter_click'
  | 'new_conversation';

type Schema = Record<string, 'number' | readonly string[]>;

const GROUPS = ['quote', 'source', 'further'] as const;

const SCHEMAS: Record<ChatEvent, Schema> = {
  chat_open: {},
  message_send: { turn_index: 'number' },
  answer_received: { latency_ms: 'number', n_quotes: 'number', n_refs: 'number', n_further: 'number' },
  quota_hit: {},
  sign_in: {},
  feedback: { value: ['up', 'down'] },
  export: { format: ['md', 'json'] },
  share: { stage: ['create', 'copy'] },
  source_click: { group: GROUPS, source_type: SOURCE_TYPES as readonly string[] },
  starter_click: { index: 'number' },
  new_conversation: {},
};

export type EventParams = Record<string, string | number | undefined>;

export function cleanParams(name: ChatEvent, params: EventParams = {}): Record<string, string | number> {
  const schema = SCHEMAS[name];
  const out: Record<string, string | number> = {};
  for (const [key, rule] of Object.entries(schema)) {
    const v = params[key];
    if (rule === 'number') {
      if (typeof v === 'number' && Number.isFinite(v)) out[key] = Math.round(v);
    } else if (typeof v === 'string' && rule.includes(v)) {
      out[key] = v;
    }
  }
  return out;
}

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

export function track(name: ChatEvent, params?: EventParams): void {
  if (typeof window === 'undefined') return;
  try {
    if (navigator.doNotTrack === '1') return;
    const w = window as GtagWindow;
    const clean = cleanParams(name, params);
    if (typeof w.gtag === 'function') {
      w.gtag('event', name, clean);
    } else {
      w.dataLayer = w.dataLayer || [];
      // gtag.js reads queued commands as `arguments` objects, exactly as its own gtag() pushes them.
      (function gtag(..._args: unknown[]) {
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments);
      })('event', name, clean);
    }
  } catch {
    // analytics never breaks the chat
  }
}
