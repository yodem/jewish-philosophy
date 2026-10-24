import { parseStoredConversation, parseStoredMessage } from './validate';
import type { ChatMessage, Conversation } from './types';

/**
 * Local conversation store (anonymous visitors, and the open conversation of a signed-in one).
 * localStorage holds conversation content only: no tokens, no Auth.js data, no user ids. Everything read back is
 * schema-validated (parseStoredConversation), so a tampered entry cannot inject markup or odd shapes.
 */
export const STORE_KEY = 'sadik-chat-v2';
/** Round-1 transcript (one flat list of messages); migrated into one conversation on first load. */
export const LEGACY_KEY = 'sadik-chat-v1';
const MAX_CONVERSATIONS = 20;
const TITLE_MAX = 80;

export interface LocalStore {
  current: string | null;
  conversations: Conversation[];
}

/** uuid4 as 32 lowercase hex characters (the bridge's `conversation_id` format). */
export function newConversationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID().replace(/-/g, '');
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function titleFrom(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === 'user');
  return first ? first.text.replace(/\s+/g, ' ').trim().slice(0, TITLE_MAX) : '';
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function loadStore(): LocalStore {
  const data = readJson(STORE_KEY);
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const d = data as { current?: unknown; conversations?: unknown };
    const conversations = Array.isArray(d.conversations) ? d.conversations.flatMap((c) => parseStoredConversation(c) ?? []) : [];
    const current = typeof d.current === 'string' && conversations.some((c) => c.id === d.current) ? d.current : null;
    return { current, conversations };
  }
  const legacy = readJson(LEGACY_KEY);
  if (Array.isArray(legacy)) {
    const messages = legacy.flatMap((m) => parseStoredMessage(m) ?? []);
    if (messages.length) {
      const c: Conversation = { id: newConversationId(), title: titleFrom(messages), messages, updated: Date.now() };
      return { current: c.id, conversations: [c] };
    }
  }
  return { current: null, conversations: [] };
}

export function saveStore(store: LocalStore): void {
  try {
    const conversations = [...store.conversations]
      .filter((c) => c.messages.length)
      .sort((a, b) => b.updated - a.updated)
      .slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(STORE_KEY, JSON.stringify({ current: store.current, conversations }));
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // storage unavailable: the chat still works for this page view
  }
}

/** Removes every locally stored conversation (sign-out). */
export function clearStore(): void {
  try {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // nothing to clear
  }
}

/** Puts `conversation` into the store (replacing the same id) and makes it current. */
export function upsert(store: LocalStore, conversation: Conversation): LocalStore {
  const others = store.conversations.filter((c) => c.id !== conversation.id);
  return { current: conversation.id, conversations: [conversation, ...others] };
}
