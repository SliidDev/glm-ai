import { Chat, ChatMessage, MessageRole } from '../types';
import { generateId } from '../utils/id';

const TITLE_MAX_LENGTH = 48;

/** Turns a user's first message into a short chat title, the way
 * ChatGPT/Claude-style apps do — first line, trimmed, no markdown
 * fences or leading punctuation. */
export function deriveChatTitle(firstMessage: string): string {
  const firstLine = firstMessage.split('\n')[0].replace(/^[#*_`\-\s]+/, '').trim();
  if (!firstLine) return 'New chat';
  if (firstLine.length <= TITLE_MAX_LENGTH) return firstLine;
  return `${firstLine.slice(0, TITLE_MAX_LENGTH - 1).trimEnd()}…`;
}

export function createChat(title = 'New chat'): Chat {
  const now = Date.now();
  return {
    id: generateId('chat'),
    title,
    createdAt: now,
    updatedAt: now,
    pinned: false,
    lastMessagePreview: '',
  };
}

export function createMessage(
  chatId: string,
  role: MessageRole,
  content: string,
  status: ChatMessage['status'] = 'sent'
): ChatMessage {
  return {
    id: generateId('msg'),
    chatId,
    role,
    content,
    createdAt: Date.now(),
    status,
    isFavorite: false,
  };
}

/** Short preview text for the chat-list row (last message, single
 * line, markdown stripped enough to not show raw ``` fences). */
export function derivePreview(message: string): string {
  const singleLine = message.replace(/\n+/g, ' ').replace(/```[\s\S]*?```/g, '[code]').trim();
  return singleLine.length > 80 ? `${singleLine.slice(0, 79).trimEnd()}…` : singleLine;
}

export function filterChatsByQuery(chats: Chat[], query: string): Chat[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return chats;
  return chats.filter(
    (c) =>
      c.title.toLocaleLowerCase().includes(q) ||
      c.lastMessagePreview.toLocaleLowerCase().includes(q)
  );
}
