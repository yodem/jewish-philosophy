/** Known source kinds; the bridge may add new ones (e.g. `article`), which render with a generic label. */
export type SourceType =
  | 'responsa'
  | 'writing'
  | 'blog'
  | 'term'
  | 'video'
  | 'playlist'
  | 'academic'
  | 'article'
  | 'comment'
  | 'primary'
  | (string & {});

/** `sadik`, `visitor`, `maimonides`, or another speaker the bridge names (`other`). */
export type Speaker = 'sadik' | 'visitor' | 'maimonides' | (string & {});

export interface Citation {
  n: number;
  chunk_id: string;
  title: string;
  url: string;
  source_type: SourceType;
  speaker: Speaker;
  quote: string | null;
  /** "mm:ss" / "h:mm:ss" (video moment) or "עמ׳ N" (PDF page); null/absent when the link has no finer place. */
  locator_label?: string | null;
  /** `quote`: a verbatim quotation from a primary source or article; `reference`: title + link only. Absent on old messages. */
  kind?: 'quote' | 'reference';
  /** Up to ~280 chars of the verified source text, for the source preview. */
  snippet?: string;
}

export interface FurtherReading {
  title: string;
  url: string;
  locator_label: string | null;
  source_type: SourceType;
  snippet?: string;
}

export interface UserMessage {
  role: 'user';
  text: string;
}

export type Vote = 'up' | 'down';

export interface BotMessage {
  role: 'bot';
  text: string;
  citations: Citation[];
  further_reading?: FurtherReading[];
  error?: boolean;
  /** The anonymous daily quota blocked this question: the UI asks the visitor to sign in. */
  quota?: boolean;
  turn_id?: string;
  vote?: Vote;
}

export type ChatMessage = UserMessage | BotMessage;

export interface SSEEvent {
  event: string;
  data: unknown;
}

/** One conversation: a uuid4 hex id shared by every turn (the bridge keeps one multi-turn session per id). */
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  updated: number;
}

/** A row of the signed-in conversation list. */
export interface ConversationSummary {
  id: string;
  title: string;
  last_ts: string;
  n_turns: number;
}

/** What the site knows about sign-in: disabled (no AUTH_* configured), signed out, or signed in. */
export type AuthState = 'disabled' | 'signed_out' | 'signed_in';

/** The read-only payload of a shared answer. */
export interface SharedAnswer {
  question: string;
  text: string;
  citations: Citation[];
  further_reading: FurtherReading[];
  ts?: string;
}
