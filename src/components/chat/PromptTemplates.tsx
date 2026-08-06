import React from 'react';
import { View, Text, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { usePromptHistory } from '../../hooks/usePromptHistory';
import { PROMPT_TEMPLATES } from '../../constants/promptTemplates';

interface PromptTemplateChipsProps {
  onSelectPrompt: (text: string) => void;
}

/** Compact horizontal chips shown above the input on an empty chat —
 * templates only, recent prompts stay in the full sheet since a
 * brand-new chat is exactly when "recent prompts" is least relevant. */
export function PromptTemplateChips({ onSelectPrompt }: PromptTemplateChipsProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
      {PROMPT_TEMPLATES.map((template) => (
        <Pressable
          key={template.id}
          onPress={() => onSelectPrompt(t(template.promptKey))}
          accessibilityRole="button"
          accessibilityLabel={t(template.titleKey)}
          style={[styles.chip, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
        >
          <Ionicons name={template.icon as keyof typeof Ionicons.glyphMap} size={14} color={theme.colors.primary} />
          <Text style={[styles.chipText, { color: theme.colors.text, fontFamily: theme.fontFamily.medium }]} numberOfLines={1}>
            {t(template.titleKey)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

interface PromptTemplatesSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectPrompt: (text: string) => void;
}

/** Full sheet opened from the sparkle icon in the input bar — every
 * template plus the person's own recent prompts, so re-asking
 * something similar doesn't mean retyping it. */
export function PromptTemplatesSheet({ visible, onClose, onSelectPrompt }: PromptTemplatesSheetProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { history } = usePromptHistory();

  const select = (text: string) => {
    onClose();
    onSelectPrompt(text);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[styles.overlay, { backgroundColor: theme.colors.overlay }]} onPress={onClose} accessibilityRole="button">
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.surfaceElevated, paddingBottom: insets.bottom + 16, borderTopLeftRadius: theme.radius.xl, borderTopRightRadius: theme.radius.xl },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.grabber, { backgroundColor: theme.colors.border }]} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.semiBold }]}>
              {t('chat.templatesTitle')}
            </Text>
            {PROMPT_TEMPLATES.map((template) => (
              <Pressable
                key={template.id}
                onPress={() => select(t(template.promptKey))}
                accessibilityRole="button"
                style={({ pressed }) => [styles.listRow, { opacity: pressed ? 0.6 : 1 }]}
              >
                <View style={[styles.templateIcon, { backgroundColor: theme.colors.primarySoft }]}>
                  <Ionicons name={template.icon as keyof typeof Ionicons.glyphMap} size={16} color={theme.colors.primary} />
                </View>
                <View style={styles.listTextColumn}>
                  <Text style={[styles.listTitle, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold }]}>
                    {t(template.titleKey)}
                  </Text>
                  <Text
                    style={[styles.listSubtitle, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}
                    numberOfLines={1}
                  >
                    {t(template.promptKey)}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Text style={[styles.sectionTitle, styles.secondSection, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.semiBold }]}>
              {t('chat.recentPromptsTitle')}
            </Text>
            {history.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>
                {t('chat.noRecentPrompts')}
              </Text>
            ) : (
              history.map((prompt) => (
                <Pressable
                  key={prompt.id}
                  onPress={() => select(prompt.text)}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.listRow, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <View style={[styles.templateIcon, { backgroundColor: theme.colors.surfacePressed }]}>
                    <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
                  </View>
                  <Text
                    style={[styles.listTitle, { color: theme.colors.text, fontFamily: theme.fontFamily.regular, flex: 1 }]}
                    numberOfLines={1}
                  >
                    {prompt.text}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipsRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '75%',
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
    textAlign: 'auto',
  },
  secondSection: {
    marginTop: 18,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  templateIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTextColumn: {
    flex: 1,
  },
  listTitle: {
    fontSize: 14,
    textAlign: 'auto',
  },
  listSubtitle: {
    fontSize: 12,
    marginTop: 1,
    textAlign: 'auto',
  },
  emptyText: {
    fontSize: 13,
    paddingVertical: 8,
    textAlign: 'auto',
  },
});
