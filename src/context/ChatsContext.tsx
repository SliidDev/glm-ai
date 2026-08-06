import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Chat } from '../types';
import * as chatStorage from '../storage/chatStorage';

interface ChatsContextValue {
  chats: Chat[];
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  /** Registers a chat in the persisted list. Chats are intentionally
   * NOT added here at creation time — a "new chat" only becomes a
   * real list entry once its first message is sent (see
   * hooks/useChatMessages.ts), so an abandoned blank chat never
   * clutters the home screen. */
  addChat: (chat: Chat) => Promise<void>;
  updateChat: (chat: Chat) => Promise<void>;
  removeChat: (chatId: string) => Promise<void>;
  togglePin: (chatId: string) => Promise<void>;
  renameChat: (chatId: string, title: string) => Promise<void>;
  clearAllChats: () => Promise<void>;
}

const ChatsContext = createContext<ChatsContextValue | undefined>(undefined);

export function ChatsProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    const stored = await chatStorage.getChats();
    setChats(stored);
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  const addChat = useCallback(async (chat: Chat) => {
    setChats((prev) => [chat, ...prev]);
    await chatStorage.upsertChat(chat);
  }, []);

  const updateChat = useCallback(async (chat: Chat) => {
    setChats((prev) => {
      const next = prev.map((c) => (c.id === chat.id ? chat : c));
      return next.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
    });
    await chatStorage.upsertChat(chat);
  }, []);

  const removeChat = useCallback(async (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    await chatStorage.deleteChat(chatId);
  }, []);

  const togglePin = useCallback(
    async (chatId: string) => {
      const target = chats.find((c) => c.id === chatId);
      if (!target) return;
      await updateChat({ ...target, pinned: !target.pinned, updatedAt: Date.now() });
    },
    [chats, updateChat]
  );

  const renameChat = useCallback(
    async (chatId: string, title: string) => {
      const target = chats.find((c) => c.id === chatId);
      if (!target) return;
      await updateChat({ ...target, title });
    },
    [chats, updateChat]
  );

  const clearAllChats = useCallback(async () => {
    const ids = chats.map((c) => c.id);
    setChats([]);
    await chatStorage.clearAllChats(ids);
  }, [chats]);

  const value = useMemo(
    () => ({
      chats,
      isLoading,
      isRefreshing,
      refresh,
      addChat,
      updateChat,
      removeChat,
      togglePin,
      renameChat,
      clearAllChats,
    }),
    [chats, isLoading, isRefreshing, refresh, addChat, updateChat, removeChat, togglePin, renameChat, clearAllChats]
  );

  return <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>;
}

export function useChats(): ChatsContextValue {
  const ctx = useContext(ChatsContext);
  if (!ctx) throw new Error('useChats must be used within a ChatsProvider');
  return ctx;
}
