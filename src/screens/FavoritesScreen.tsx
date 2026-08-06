import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoriteMessageRef } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useHaptics } from '../hooks/useHaptics';
import { useFavorites } from '../hooks/useFavorites';
import { formatFullDateTime } from '../utils/dateFormat';
import { Routes } from '../navigation/routes';

import { ChatHeader } from '../components/chat/ChatHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ChatListSkeletonList } from '../components/common/Skeleton';

export function FavoritesScreen() {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const haptics = useHaptics();
  const router = useRouter();
  const { favorites, isLoading, removeFavorite } = useFavorites();

  const renderItem = ({ item }: { item: FavoriteMessageRef }) => (
    <Pressable
      onPress={() => router.push(Routes.chat(item.chatId))}
      accessibilityRole="button"
      accessibilityLabel={`${item.chatTitle}. ${item.content}`}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.surface, borderRadius: theme.radius.md },
      ]}
    >
      <View style={styles.rowText}>
        <Text style={[styles.chatTitle, { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold }]} numberOfLines={1}>
          {item.chatTitle || t('common.new')}
        </Text>
        <Text style={[styles.content, { color: theme.colors.text, fontFamily: theme.fontFamily.regular }]} numberOfLines={3}>
          {item.content}
        </Text>
        <Text style={[styles.date, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>
          {formatFullDateTime(item.createdAt, language)}
        </Text>
      </View>
      <Pressable
        onPress={() => {
          haptics.selection();
          void removeFavorite(item.messageId);
        }}
        accessibilityRole="button"
        accessibilityLabel={t('chat.favoriteRemove')}
        hitSlop={8}
        style={styles.removeButton}
      >
        <Ionicons name="star" size={18} color={theme.colors.warning} />
      </Pressable>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ChatHeader title={t('favorites.title')} onBack={() => router.back()} />
      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <ChatListSkeletonList count={4} />
        </View>
      ) : favorites.length === 0 ? (
        <EmptyState icon="star-outline" title={t('favorites.empty')} subtitle={t('favorites.emptySubtitle')} />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(f) => f.messageId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  skeletonWrap: {
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    gap: 10,
  },
  rowText: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'auto',
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'auto',
  },
  date: {
    fontSize: 11,
    marginTop: 6,
  },
  removeButton: {
    padding: 4,
  },
});
