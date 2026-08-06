import React from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatHeaderProps {
  title: string;
  onBack: () => void;
  onOpenMenu?: () => void;
}

export function ChatHeader({ title, onBack, onOpenMenu }: ChatHeaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 6, backgroundColor: theme.colors.backgroundElevated, borderBottomColor: theme.colors.border },
      ]}
    >
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={t('common.back')} hitSlop={10} style={styles.iconButton}>
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} style={styles.backIcon} />
      </Pressable>
      <Text
        style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold }]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>
      {onOpenMenu ? (
        <Pressable
          onPress={onOpenMenu}
          accessibilityRole="button"
          accessibilityLabel={t('chat.messageActions')}
          hitSlop={10}
          style={styles.iconButton}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButton} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    // Ionicons "chevron-back" is a fixed left-pointing glyph — flip it
    // for RTL so it still points toward "back" (the reading start).
    transform: [{ scaleX: I18nManager.isRTL ? -1 : 1 }],
  },
  title: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 4,
  },
});
