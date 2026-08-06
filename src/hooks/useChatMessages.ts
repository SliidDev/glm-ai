import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useChats } from '../context/ChatsContext';
import * as chatStorage from '../storage/chatStorage';
import * as favoritesStorage from '../storage/favoritesStorage';
import { addPromptToHistory } from '../storage/promptHistoryStorage';
import { sendMessage as callAi } from '../api/aiService';
import { createChat, createMessage, deriveChatTitle, derivePreview } from '../services/chatService';
import { isBlank } from '../utils/validators';

/** Any message still 'sending' or 'streaming' when the app last closed
 * has no way to resume — 'streaming' already holds the full reply
 * (see the success branch below) so it just needs to stop being
 * treated as animating; 'sending' never got a reply, so it's safest
 * to surface it as failed rather than pretend it's fine. */
function normalizeStaleMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => {
    if (m.status === 'streaming') return { ...m, status: 'sent' };
    if (m.status === 'sending') return { ...m, status: 'error', errorMessage: 'errors.unknown' };
    return m;
  });
}

export function useChatMessages(chatId: string) {
  const { settings } = useSettings();
  const { chats, addChat, updateChat } = useChats();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [stopRequested, setStopRequested] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    hasLoadedRef.current = false;
    setIsLoadingHistory(true);
    void (async () => {
      const stored = await chatStorage.getMessages(chatId);
      setMessages(normalizeStaleMessages(stored));
      setIsLoadingHistory(false);
      hasLoadedRef.current = true;
    })();
  }, [chatId]);

  useEffect(() => {
    if (!hasLoadedRef.current) return; // don't stomp storage with [] before the load above runs
    void chatStorage.saveMessages(chatId, messages);
  }, [chatId, messages]);

  const chatMeta = chats.find((c) => c.id === chatId);

  const persistChatMeta = useCallback(
    async (lastMessageText: string) => {
      const now = Date.now();
      if (!chatMeta) {
        const chat = {
          ...createChat(deriveChatTitle(lastMessageText)),
          id: chatId,
          updatedAt: now,
          lastMessagePreview: derivePreview(lastMessageText),
        };
        await addChat(chat);
      } else {
        await updateChat({
          ...chatMeta,
          updatedAt: now,
          lastMessagePreview: derivePreview(lastMessageText),
        });
      }
    },
    [chatMeta, chatId, addChat, updateChat]
  );

  /** Shared tail-end of both "send a new message" and "regenerate /
   * retry" — everything from calling the API onward is identical, the
   * only difference is whether a new user bubble gets appended first. */
  const runAssistantTurn = useCallback(
    async (userText: string) => {
      const pending = createMessage(chatId, 'assistant', '', 'sending');
      setMessages((prev) => [...prev, pending]);
      setIsGenerating(true);
      setStopRequested(false);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const result = await callAi(
        userText,
        { model: settings.model, temperature: settings.temperature, maxTokens: settings.maxTokens },
        controller.signal
      );

      abortControllerRef.current = null;

      if (result.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === pending.id ? { ...m, content: result.reply, status: 'streaming' } : m))
        );
        setStreamingMessageId(pending.id);
        // isGenerating stays true — onStreamSettled below clears it
        // once the reveal animation finishes or is stopped.
      } else if (result.aborted) {
        setMessages((prev) => prev.filter((m) => m.id !== pending.id));
        setIsGenerating(false);
      } else {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pending.id ? { ...m, status: 'error', errorMessage: result.errorMessage } : m
          )
        );
        setIsGenerating(false);
      }
    },
    [chatId, settings.model, settings.temperature, settings.maxTokens]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (isBlank(text) || isGenerating) return;
      const trimmed = text.trim();
      const userMsg = createMessage(chatId, 'user', trimmed, 'sent');
      setMessages((prev) => [...prev, userMsg]);
      void addPromptToHistory(trimmed);
      void persistChatMeta(trimmed);
      await runAssistantTurn(trimmed);
    },
    [chatId, isGenerating, persistChatMeta, runAssistantTurn]
  );

  const regenerate = useCallback(async () => {
    if (isGenerating) return;
    const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
    if (lastAssistantIdx === -1) return;
    const idx = messages.length - 1 - lastAssistantIdx;
    const lastUser = [...messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((prev) => prev.filter((_, i) => i !== idx));
    await runAssistantTurn(lastUser.content);
  }, [messages, isGenerating, runAssistantTurn]);

  const retryMessage = useCallback(
    async (messageId: string) => {
      if (isGenerating) return;
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx === -1) return;
      const lastUser = [...messages.slice(0, idx)].reverse().find((m) => m.role === 'user');
      if (!lastUser) return;
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      await runAssistantTurn(lastUser.content);
    },
    [messages, isGenerating, runAssistantTurn]
  );

  const stopGenerating = useCallback(() => {
    if (streamingMessageId) {
      setStopRequested(true); // MessageBubble's useTypewriter reacts to this
    } else if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [streamingMessageId]);

  /** Called by MessageBubble once its reveal animation finishes or is
   * stopped — `finalText` is authoritative for what actually gets
   * persisted (may be a truncated version of the full reply). */
  const onStreamSettled = useCallback(
    (messageId: string, finalText: string) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: finalText, status: 'sent' } : m))
      );
      setStreamingMessageId(null);
      setStopRequested(false);
      setIsGenerating(false);
      void persistChatMeta(finalText);
    },
    [persistChatMeta]
  );

  const toggleFavorite = useCallback(
    async (messageId: string) => {
      const target = messages.find((m) => m.id === messageId);
      if (!target) return;
      const nextFavorite = !target.isFavorite;
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, isFavorite: nextFavorite } : m)));
      if (nextFavorite) {
        await favoritesStorage.addFavorite({
          messageId,
          chatId,
          chatTitle: chatMeta?.title ?? '',
          content: target.content,
          createdAt: target.createdAt,
        });
      } else {
        await favoritesStorage.removeFavorite(messageId);
      }
    },
    [messages, chatId, chatMeta]
  );

  return {
    messages,
    chatMeta,
    isLoadingHistory,
    isGenerating,
    streamingMessageId,
    stopRequested,
    sendMessage,
    regenerate,
    retryMessage,
    stopGenerating,
    onStreamSettled,
    toggleFavorite,
  };
}
