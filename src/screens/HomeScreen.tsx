import React, { useState } from 'react';
import { View, Text, SectionList, FlatList, Pressable, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useHaptics } from '../hooks/useHaptics';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useChats } from '../context/ChatsContext';
import { useToast } from '../context/ToastContext';
import { filterChatsByQuery } from '../services/chatService';
import { exportChatToFile } from '../services/exportService';
import * as chatStorage from '../storage/chatStorage';
import { generateId } from '../utils/id';
import { Routes } from '../navigation/routes';

import { SearchBar } from '../components/home/SearchBar';
import { ChatListItem } from '../components/home/ChatListItem';
import { RenameDialog } from '../components/home/RenameDialog';
import { ChatListSkeletonList } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ActionSheet, ActionSheetItem } from '../components/common/ActionSheet';
import { Logo } from '../components/common/Logo';

export function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const network = useNetworkStatus();
  const { showToast } = useToast();
  const { chats, isLoading, isRefreshing, refresh, removeChat, togglePin, renameChat } = useChats();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionSheetChat, setActionSheetChat] = useState<Chat | null>(null);
  const [renamingChat, setRenamingChat] = useState<Chat | null>(null);
  const [deletingChat, setDeletingChat] = useState<Chat | null>(null);

  const isSearching = searchQuery.trim().length > 0;
  const filteredChats = filterChatsByQuery(chats, searchQuery);
  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const unpinnedChats = filteredChats.filter((c) => !c.pinned);

  const sections = [
    ...(pinnedChats.length > 0 ? [{ title: t('home.pinnedSection'), data: pinnedChats }] : []),
    ...(unpinnedChats.length > 0 ? [{ title: t('home.allSection'), data: unpinnedChats }] : []),
  ];

  const openChat = (chatId: string) => router.push(Routes.chat(chatId));

  const handleNewChat = () => {
    haptics.light();
    openChat(generateId('chat'));
  };

  const handleExport = async (chat: Chat) => {
    const messages = await chatStorage.getMessages(chat.id);
    const shared = await exportChatToFile(chat, messages);
    showToast(shared ? t('chat.exportSuccess') : t('chat.exportError'), shared ? 'success' : 'error');
  };

  const actionSheetItems: ActionSheetItem[] = actionSheetChat
    ? [
        {
          key: 'pin',
          label: actionSheetChat.pinned ? t('chat.unpinChat') : t('chat.pinChat'),
          icon: actionSheetChat.pinned ? 'pin' : 'pin-outline',
          onPress: () => togglePin(actionSheetChat.id),
        },
        {
          key: 'rename',
          label: t('chat.renameChat'),
          icon: 'pencil-outline',
          onPress: () => setRenamingChat(actionSheetChat),
        },
        {
          key: 'export',
          label: t('chat.exportChat'),
          icon: 'share-outline',
          onPress: () => handleExport(actionSheetChat),
        },
        {
          key: 'delete',
          label: t('chat.deleteChat'),
          icon: 'trash-outline',
          destructive: true,
          onPress: () => setDeletingChat(actionSheetChat),
        },
      ]
    : [];

  const renderItem = ({ item }: { item: Chat }) => (
    <ChatListItem
      chat={item}
      searchQuery={isSearching ? searchQuery : undefined}
      onPress={() => openChat(item.id)}
      onLongPress={() => {
        haptics.medium();
        setActionSheetChat(item);
      }}
      onDelete={() => setDeletingChat(item)}
      onTogglePin={() => togglePin(item.id)}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <OfflineBanner visible={!network.isConnected} />

      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Logo size={30} />
          <Text style={[styles.headerTitle, { color: theme.colors.text, fontFamily: theme.fontFamily.extraBold }]}>
            {t('home.title')}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push(Routes.favorites)}
            accessibilityRole="button"
            accessibilityLabel={t('home.favorites')}
            hitSlop={8}
            style={styles.headerIconButton}
          >
            <Ionicons name="star-outline" size={21} color={theme.colors.text} />
          </Pressable>
          <Pressable
            onPress={() => router.push(Routes.settings)}
            accessibilityRole="button"
            accessibilityLabel={t('home.settings')}
            hitSlop={8}
            style={styles.headerIconButton}
          >
            <Ionicons name="settings-outline" size={21} color={theme.colors.text} />
          </Pressable>
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

      {isLoading ? (
        <ChatListSkeletonList />
      ) : chats.length === 0 ? (
        <EmptyState
          icon="chatbubbles-outline"
          title={t('home.emptyTitle')}
          subtitle={t('home.emptySubtitle')}
        />
      ) : isSearching ? (
        filteredChats.length === 0 ? (
          <EmptyState icon="search-outline" title={t('home.noResultsTitle')} subtitle={t('home.noResultsSubtitle')} />
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(c) => c.id}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
          />
        )
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: theme.colors.textMuted, backgroundColor: theme.colors.background }]}>
              {section.title}
            </Text>
          )}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={theme.colors.primary} />
          }
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Pressable
        onPress={handleNewChat}
        accessibilityRole="button"
        accessibilityLabel={t('home.newChat')}
        style={[styles.fab, { backgroundColor: theme.colors.primary, bottom: insets.bottom + 20 }]}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <ActionSheet
        visible={!!actionSheetChat}
        onClose={() => setActionSheetChat(null)}
        title={actionSheetChat?.title}
        actions={actionSheetItems}
      />

      <RenameDialog
        visible={!!renamingChat}
        currentTitle={renamingChat?.title ?? ''}
        onCancel={() => setRenamingChat(null)}
        onSave={(title) => {
          if (renamingChat) void renameChat(renamingChat.id, title);
          setRenamingChat(null);
        }}
      />

      <ConfirmDialog
        visible={!!deletingChat}
        title={t('home.deleteConfirmTitle')}
        message={t('home.deleteConfirmMessage', { title: deletingChat?.title ?? '' })}
        destructive
        confirmLabel={t('common.delete')}
        onCancel={() => setDeletingChat(null)}
        onConfirm={() => {
          if (deletingChat) {
            haptics.success();
            void removeChat(deletingChat.id);
          }
          setDeletingChat(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    textAlign: 'auto',
  },
  listContent: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    end: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
});
