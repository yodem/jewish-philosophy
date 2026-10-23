export type SourceType =
  | 'responsa'
  | 'writing'
  | 'blog'
  | 'term'
  | 'video'
  | 'playlist'
  | 'academic'
  | 'comment'
  | 'primary';

export type Speaker = 'sadik' | 'visitor' | 'maimonides';

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
}

export interface FurtherReading {
  title: string;
  url: string;
  locator_label: string | null;
  source_type: SourceType;
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
  turn_id?: string;
  vote?: Vote;
}

export type ChatMessage = UserMessage | BotMessage;

export interface SSEEvent {
  event: string;
  data: unknown;
}
