import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Highlighter from 'react-native-highlight-words';
import { Ionicons } from '@expo/vector-icons';
import { Chat } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { formatChatListDate } from '../../utils/dateFormat';

interface ChatListItemProps {
  chat: Chat;
  searchQuery?: string;
  onPress: () => void;
  onLongPress: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}

export function ChatListItem({ chat, searchQuery, onPress, onLongPress, onDelete, onTogglePin }: ChatListItemProps) {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const swipeableRef = useRef<Swipeable>(null);

  const dateLabel = formatChatListDate(chat.updatedAt, language, {
    today: t('chat.today'),
    yesterday: t('chat.yesterday'),
  });

  const renderRightActions = () => (
    <View style={styles.actionsRow}>
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onTogglePin();
        }}
        accessibilityRole="button"
        accessibilityLabel={chat.pinned ? t('common.unpin') : t('common.pin')}
        style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name={chat.pinned ? 'pin' : 'pin-outline'} size={20} color="#FFFFFF" />
      </Pressable>
      <Pressable
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}
        accessibilityRole="button"
        accessibilityLabel={t('common.delete')}
        style={[styles.actionButton, { backgroundColor: theme.colors.error }]}
      >
        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
      </Pressable>
    </View>
  );

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} friction={2} overshootFriction={8}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityLabel={`${chat.title}. ${chat.lastMessagePreview}. ${dateLabel}${chat.pinned ? `. ${t('common.pin')}` : ''}`}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: pressed ? theme.colors.surfacePressed : theme.colors.background },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.colors.primarySoft }]}>
          <Ionicons name="chatbubble-ellipses" size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            {searchQuery ? (
              <Highlighter
                style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold }]}
                highlightStyle={{ backgroundColor: theme.colors.primarySoft, color: theme.colors.primary }}
                searchWords={[searchQuery]}
                textToHighlight={chat.title}
                numberOfLines={1}
                autoEscape
              />
            ) : (
              <Text
                style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold }]}
                numberOfLines={1}
              >
                {chat.title}
              </Text>
            )}
            {chat.pinned && <Ionicons name="pin" size={13} color={theme.colors.primary} style={styles.pinIcon} />}
          </View>
          <Text
            style={[styles.preview, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}
            numberOfLines={1}
          >
            {chat.lastMessagePreview || ' '}
          </Text>
        </View>
        <Text style={[styles.date, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>
          {dateLabel}
        </Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    flexShrink: 1,
    textAlign: 'auto',
  },
  pinIcon: {
    marginStart: 6,
  },
  preview: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'auto',
  },
  date: {
    fontSize: 11,
    marginStart: 8,
  },
  actionsRow: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
