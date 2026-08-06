import { STORAGE_VERSION } from '../constants/config';

// Every AsyncStorage key the app touches, in one place, versioned so
// a future breaking change to any stored shape can ship as a new key
// (storageKeys.ts becomes the single migration point) without a
// silent crash trying to parse old data with a new shape.
const ns = (key: string) => `@grex_ai/${key}/${STORAGE_VERSION}`;

export const StorageKeys = {
  chatList: ns('chats'),
  chatMessages: (chatId: string) => ns(`chat_messages_${chatId}`),
  settings: ns('settings'),
  favorites: ns('favorites'),
  promptHistory: ns('prompt_history'),
  hasOnboarded: ns('has_onboarded'),
} as const;
