import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChatMessage } from '../../types';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHaptics } from '../../hooks/useHaptics';
import { useTypewriter } from '../../hooks/useTypewriter';
import { formatMessageTime } from '../../utils/dateFormat';
import { resolveErrorMessage } from '../../utils/errorMessages';
import { copyToClipboard } from '../../utils/clipboard';
import { shareText } from '../../utils/share';
import { MarkdownMessage } from './MarkdownMessage';
import { StaticLogoDot } from '../common/Logo';
import { useToast } from '../../context/ToastContext';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming: boolean;
  stopRequested: boolean;
  isLastAssistantMessage: boolean;
  onStreamSettled: (messageId: string, finalText: string) => void;
  onToggleFavorite: (messageId: string) => void;
  onRegenerate: () => void;
  onRetry: (messageId: string) => void;
  onLongPress: (message: ChatMessage) => void;
}

export function MessageBubble({
  message,
  isStreaming,
  stopRequested,
  isLastAssistantMessage,
  onStreamSettled,
  onToggleFavorite,
  onRegenerate,
  onRetry,
  onLongPress,
}: MessageBubbleProps) {
  const theme = useTheme();
  const { t, language } = useTranslation();
  const reducedMotion = useReducedMotion();
  const haptics = useHaptics();
  const { showToast } = useToast();

  const isUser = message.role === 'user';

  const { displayedText } = useTypewriter(message.content, {
    active: isStreaming,
    stopRequested,
    reducedMotion,
    onSettled: (finalText) => onStreamSettled(message.id, finalText),
  });

  const bodyText = isStreaming ? displayedText : message.content;

  const handleCopy = async () => {
    const ok = await copyToClipboard(message.content);
    if (ok) {
      haptics.light();
      showToast(t('chat.copied'), 'success');
    }
  };

  const handleShare = async () => {
    await shareText(message.content);
  };

  const handleFavorite = () => {
    haptics.selection();
    onToggleFavorite(message.id);
    showToast(message.isFavorite ? t('chat.unfavorited') : t('chat.favorited'));
  };

  if (message.status === 'error') {
    return (
      <View style={[styles.container, isUser ? styles.alignEnd : styles.alignStart]}>
        <View style={[styles.bubble, { backgroundColor: theme.colors.errorSoft, borderColor: theme.colors.error, borderWidth: 1 }]}>
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error, fontFamily: theme.fontFamily.medium }]}>
              {resolveErrorMessage(message.errorMessage ?? '', t)}
            </Text>
          </View>
          <Pressable
            onPress={() => onRetry(message.id)}
            accessibilityRole="button"
            accessibilityLabel={t('chat.retrySend')}
            style={styles.retryButton}
          >
            <Ionicons name="refresh" size={14} color={theme.colors.primary} />
            <Text style={[styles.retryText, { color: theme.colors.primary, fontFamily: theme.fontFamily.semiBold }]}>
              {t('chat.retrySend')}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.alignEnd : styles.alignStart]}>
      <View style={[styles.row, isUser ? styles.rowReverse : undefined]}>
        {!isUser && (
          <View style={styles.avatarWrap}>
            <StaticLogoDot size={24} />
          </View>
        )}
        <Pressable
          onLongPress={() => {
            if (message.status === 'sent') {
              haptics.medium();
              onLongPress(message);
            }
          }}
          delayLongPress={280}
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: theme.colors.userBubble, borderBottomEndRadius: 4 }
              : { backgroundColor: theme.colors.aiBubble, borderBottomStartRadius: 4 },
          ]}
        >
          {isUser ? (
            <Text
              style={[styles.userText, { color: theme.colors.userBubbleText, fontFamily: theme.fontFamily.regular }]}
              selectable
            >
              {message.content}
            </Text>
          ) : (
            <MarkdownMessage content={bodyText || ' '} textColor={theme.colors.aiBubbleText} />
          )}
        </Pressable>
      </View>

      <View style={[styles.metaRow, isUser ? styles.metaRowEnd : styles.metaRowStart]}>
        {message.isFavorite && <Ionicons name="star" size={11} color={theme.colors.warning} style={styles.favoriteDot} />}
        <Text style={[styles.timestamp, { color: theme.colors.textMuted }]}>
          {formatMessageTime(message.createdAt, language)}
        </Text>
      </View>

      {!isUser && message.status === 'sent' && (
        <View style={[styles.actionsRow, styles.metaRowStart]}>
          <Pressable onPress={handleCopy} accessibilityRole="button" accessibilityLabel={t('chat.copyMessage')} hitSlop={8} style={styles.actionIcon}>
            <Ionicons name="copy-outline" size={15} color={theme.colors.textMuted} />
          </Pressable>
          <Pressable onPress={handleShare} accessibilityRole="button" accessibilityLabel={t('chat.shareMessage')} hitSlop={8} style={styles.actionIcon}>
            <Ionicons name="share-outline" size={15} color={theme.colors.textMuted} />
          </Pressable>
          <Pressable
            onPress={handleFavorite}
            accessibilityRole="button"
            accessibilityLabel={message.isFavorite ? t('chat.favoriteRemove') : t('chat.favoriteAdd')}
            hitSlop={8}
            style={styles.actionIcon}
          >
            <Ionicons
              name={message.isFavorite ? 'star' : 'star-outline'}
              size={15}
              color={message.isFavorite ? theme.colors.warning : theme.colors.textMuted}
            />
          </Pressable>
          {isLastAssistantMessage && (
            <Pressable
              onPress={onRegenerate}
              accessibilityRole="button"
              accessibilityLabel={t('chat.regenerate')}
              hitSlop={8}
              style={styles.actionIcon}
            >
              <Ionicons name="refresh-outline" size={15} color={theme.colors.textMuted} />
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    paddingHorizontal: 12,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '86%',
    gap: 6,
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  avatarWrap: {
    marginBottom: 2,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexShrink: 1,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'auto',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  metaRowEnd: {
    justifyContent: 'flex-end',
  },
  metaRowStart: {
    justifyContent: 'flex-start',
    marginStart: 32,
  },
  favoriteDot: {
    marginEnd: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  actionIcon: {
    padding: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'auto',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    fontSize: 12,
  },
});
