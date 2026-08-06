import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useHaptics } from '../hooks/useHaptics';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useChatMessages } from '../hooks/useChatMessages';
import { useChats } from '../context/ChatsContext';
import { exportChatToFile } from '../services/exportService';
import { Routes } from '../navigation/routes';

import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { PromptTemplateChips, PromptTemplatesSheet } from '../components/chat/PromptTemplates';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { EmptyState } from '../components/common/EmptyState';
import { ActionSheet, ActionSheetItem } from '../components/common/ActionSheet';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { RenameDialog } from '../components/home/RenameDialog';
import { useToast } from '../context/ToastContext';

const NEAR_BOTTOM_THRESHOLD = 120;

export function ChatScreen() {
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const insets = useSafeAreaInsets();
  const network = useNetworkStatus();
  const { showToast } = useToast();
  const { removeChat, togglePin, renameChat } = useChats();

  const {
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
  } = useChatMessages(chatId);

  const [draft, setDraft] = useState('');
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [messageSheet, setMessageSheet] = useState<ChatMessage | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const isNearBottomRef = useRef(true);

  const scrollToEndIfNearBottom = (animated: boolean) => {
    if (isNearBottomRef.current) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated }));
    }
  };

  useEffect(() => {
    scrollToEndIfNearBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    isNearBottomRef.current = distanceFromBottom < NEAR_BOTTOM_THRESHOLD;
  };

  const handleSend = (text?: string) => {
    const toSend = text ?? draft;
    if (!toSend.trim() || isGenerating) return;
    haptics.light();
    setDraft('');
    isNearBottomRef.current = true;
    void sendMessage(toSend);
  };

  const handleStop = () => {
    haptics.medium();
    stopGenerating();
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant' && m.status === 'sent')?.id;

  const handleExport = async () => {
    if (!chatMeta) return;
    const shared = await exportChatToFile(chatMeta, messages);
    showToast(shared ? t('chat.exportSuccess') : t('chat.exportError'), shared ? 'success' : 'error');
  };

  const menuActions: ActionSheetItem[] = [
    {
      key: 'pin',
      label: chatMeta?.pinned ? t('chat.unpinChat') : t('chat.pinChat'),
      icon: chatMeta?.pinned ? 'pin' : 'pin-outline',
      onPress: () => chatMeta && void togglePin(chatMeta.id),
    },
    { key: 'rename', label: t('chat.renameChat'), icon: 'pencil-outline', onPress: () => setRenameVisible(true) },
    { key: 'export', label: t('chat.exportChat'), icon: 'share-outline', onPress: handleExport },
    {
      key: 'delete',
      label: t('chat.deleteChat'),
      icon: 'trash-outline',
      destructive: true,
      onPress: () => setDeleteVisible(true),
    },
  ];

  const messageActionSheet = (message: ChatMessage): ActionSheetItem[] => [
    {
      key: 'favorite',
      label: message.isFavorite ? t('chat.favoriteRemove') : t('chat.favoriteAdd'),
      icon: message.isFavorite ? 'star' : 'star-outline',
      onPress: () => toggleFavorite(message.id),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ChatHeader
        title={chatMeta?.title ?? t('chat.newChatEmptyTitle')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace(Routes.home))}
        onOpenMenu={() => setMenuVisible(true)}
      />

      <OfflineBanner visible={!network.isConnected} />

      {!isLoadingHistory && messages.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState icon="chatbubble-ellipses-outline" title={t('chat.newChatEmptyTitle')} subtitle={t('chat.newChatEmptySubtitle')} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isStreaming={item.id === streamingMessageId}
              stopRequested={stopRequested}
              isLastAssistantMessage={item.id === lastAssistantId}
              onStreamSettled={onStreamSettled}
              onToggleFavorite={toggleFavorite}
              onRegenerate={regenerate}
              onRetry={retryMessage}
              onLongPress={setMessageSheet}
            />
          )}
          onScroll={handleScroll}
          scrollEventThrottle={100}
          onContentSizeChange={() => scrollToEndIfNearBottom(false)}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={isGenerating && !streamingMessageId ? <TypingIndicator /> : null}
        />
      )}

      {messages.length === 0 && !isLoadingHistory && (
        <PromptTemplateChips onSelectPrompt={(text) => handleSend(text)} />
      )}

      <ChatInput
        value={draft}
        onChangeText={setDraft}
        onSend={() => handleSend()}
        onStop={handleStop}
        isGenerating={isGenerating}
        onOpenTemplates={() => setTemplatesVisible(true)}
        disabled={!network.isConnected}
      />

      <PromptTemplatesSheet
        visible={templatesVisible}
        onClose={() => setTemplatesVisible(false)}
        onSelectPrompt={(text) => setDraft(text)}
      />

      <ActionSheet visible={menuVisible} onClose={() => setMenuVisible(false)} title={chatMeta?.title} actions={menuActions} />

      <ActionSheet
        visible={!!messageSheet}
        onClose={() => setMessageSheet(null)}
        actions={messageSheet ? messageActionSheet(messageSheet) : []}
      />

      <RenameDialog
        visible={renameVisible}
        currentTitle={chatMeta?.title ?? ''}
        onCancel={() => setRenameVisible(false)}
        onSave={(title) => {
          if (chatMeta) void renameChat(chatMeta.id, title);
          setRenameVisible(false);
        }}
      />

      <ConfirmDialog
        visible={deleteVisible}
        title={t('home.deleteConfirmTitle')}
        message={t('home.deleteConfirmMessage', { title: chatMeta?.title ?? '' })}
        destructive
        confirmLabel={t('common.delete')}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={() => {
          setDeleteVisible(false);
          if (chatMeta) void removeChat(chatMeta.id);
          router.replace(Routes.home);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
  },
});
