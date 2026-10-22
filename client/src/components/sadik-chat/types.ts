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
}

export interface UserMessage {
  role: 'user';
  text: string;
}

export interface BotMessage {
  role: 'bot';
  text: string;
  citations: Citation[];
  error?: boolean;
}

export type ChatMessage = UserMessage | BotMessage;

export interface SSEEvent {
  event: string;
  data: unknown;
}
