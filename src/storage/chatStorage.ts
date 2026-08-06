import { Chat, ChatMessage } from '../types';
import { StorageKeys } from './storageKeys';
import { readJSON, writeJSON, remove } from './storage';

export async function getChats(): Promise<Chat[]> {
  const chats = await readJSON<Chat[]>(StorageKeys.chatList, []);
  // newest-updated first, but pinned always floats to the top
  return [...chats].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

export async function saveChats(chats: Chat[]): Promise<void> {
  await writeJSON(StorageKeys.chatList, chats);
}

export async function upsertChat(chat: Chat): Promise<void> {
  const chats = await readJSON<Chat[]>(StorageKeys.chatList, []);
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    chats[idx] = chat;
  } else {
    chats.push(chat);
  }
  await saveChats(chats);
}

export async function deleteChat(chatId: string): Promise<void> {
  const chats = await readJSON<Chat[]>(StorageKeys.chatList, []);
  await saveChats(chats.filter((c) => c.id !== chatId));
  await remove(StorageKeys.chatMessages(chatId));
}

export async function clearAllChats(chatIds: string[]): Promise<void> {
  await writeJSON(StorageKeys.chatList, []);
  await Promise.all(chatIds.map((id) => remove(StorageKeys.chatMessages(id))));
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  return readJSON<ChatMessage[]>(StorageKeys.chatMessages(chatId), []);
}

export async function saveMessages(chatId: string, messages: ChatMessage[]): Promise<void> {
  await writeJSON(StorageKeys.chatMessages(chatId), messages);
}
