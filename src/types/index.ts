// Central type definitions for GREX AI.
// Keeping every shared shape in one file avoids the "which file
// defines Chat?" hunt as the app grows, and keeps every layer
// (storage, api, hooks, components) importing from the same source
// of truth.

export type MessageRole = 'user' | 'assistant';

export type MessageStatus =
  | 'sending' // request in flight
  | 'streaming' // reply received, still revealing on screen
  | 'sent' // fully delivered
  | 'error'; // failed — see errorMessage

export interface ChatMessage {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: number; // epoch ms
  status: MessageStatus;
  isFavorite: boolean;
  errorMessage?: string;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  lastMessagePreview: string;
}

export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'ar' | 'en';

export interface AppSettings {
  model: string;
  temperature: number;
  maxTokens: number;
  themeMode: ThemeMode;
  language: AppLanguage;
  hapticsEnabled: boolean;
}

export interface AiModelOption {
  id: string; // exact string sent to the API, e.g. "z-ai/glm-5.2"
  label: string;
  description: string;
}

export interface AiApiRequestBody {
  message: string;
  model: string;
  temperature: number;
  max_tokens: number;
}

export interface AiApiResponse {
  status: boolean;
  creator?: string;
  reply?: string;
  message?: string;
  error?: string;
}

/** Normalized result the rest of the app works with, regardless of
 * whether the failure came from the network layer or the API itself. */
export type SendResult =
  | { ok: true; reply: string; creator?: string }
  | { ok: false; errorMessage: string; aborted: boolean };

export interface PromptTemplate {
  id: string;
  /** Ionicons glyph name, e.g. "bulb-outline". Kept as a plain string
   * (rather than importing Ionicons' glyph-map type) so this file has
   * no dependency on the icon library. */
  icon: string;
  titleKey: string;
  promptKey: string;
}

export interface FavoriteMessageRef {
  messageId: string;
  chatId: string;
  chatTitle: string;
  content: string;
  createdAt: number;
}

export interface ExportedChatFile {
  app: 'GREX AI';
  exportVersion: 1;
  exportedAt: string;
  chat: Chat;
  messages: ChatMessage[];
}

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}
