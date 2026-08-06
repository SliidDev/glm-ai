import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { isBlank } from '../../utils/validators';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
  onOpenTemplates: () => void;
  disabled?: boolean;
}

export function ChatInput({ value, onChangeText, onSend, onStop, isGenerating, onOpenTemplates, disabled }: ChatInputProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const canSend = !isBlank(value) && !disabled;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundElevated,
          borderTopColor: theme.colors.border,
          paddingBottom: Math.max(insets.bottom, 10),
        },
      ]}
    >
      <Pressable
        onPress={onOpenTemplates}
        accessibilityRole="button"
        accessibilityLabel={t('chat.templatesTitle')}
        hitSlop={8}
        style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}
      >
        <Ionicons name="sparkles-outline" size={19} color={theme.colors.primary} />
      </Pressable>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={t('chat.inputPlaceholder')}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        maxLength={8000}
        editable={!disabled}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceElevated,
            color: theme.colors.text,
            fontFamily: theme.fontFamily.regular,
            borderRadius: theme.radius.lg,
          },
        ]}
        accessibilityLabel={t('chat.inputPlaceholder')}
      />

      {isGenerating ? (
        <Pressable
          onPress={onStop}
          accessibilityRole="button"
          accessibilityLabel={t('chat.stop')}
          style={[styles.sendButton, { backgroundColor: theme.colors.error }]}
        >
          <Ionicons name="stop" size={17} color="#FFFFFF" />
        </Pressable>
      ) : (
        <Pressable
          onPress={onSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={t('chat.send')}
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? theme.colors.primary : theme.colors.surfacePressed },
          ]}
        >
          <Ionicons name="arrow-up" size={19} color={canSend ? '#FFFFFF' : theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    textAlign: 'auto',
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
});
