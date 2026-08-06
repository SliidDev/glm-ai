import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily, codeSyntaxColors } from '../../constants/theme';
import { tokenizeCode } from '../../utils/syntaxHighlight';
import { copyToClipboard } from '../../utils/clipboard';
import { useHaptics } from '../../hooks/useHaptics';
import { useTranslation } from '../../hooks/useTranslation';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const DOT_COLORS = ['#FF5F57', '#FEBC2E', '#28C840'];

export function CodeBlock({ code, language }: CodeBlockProps) {
  const { t } = useTranslation();
  const haptics = useHaptics();
  const [justCopied, setJustCopied] = useState(false);

  const trimmedCode = code.replace(/\n$/, '');
  const tokens = tokenizeCode(trimmedCode);

  const handleCopy = async () => {
    const ok = await copyToClipboard(trimmedCode);
    if (ok) {
      haptics.light();
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: codeSyntaxColors.background }]}>
      <View style={styles.header}>
        <View style={styles.dots}>
          {DOT_COLORS.map((color) => (
            <View key={color} style={[styles.dot, { backgroundColor: color }]} />
          ))}
        </View>
        {!!language && (
          <Text style={[styles.language, { fontFamily: fontFamily.mono }]} numberOfLines={1}>
            {language}
          </Text>
        )}
        <Pressable
          onPress={handleCopy}
          accessibilityRole="button"
          accessibilityLabel={t('chat.copyMessage')}
          hitSlop={8}
          style={styles.copyButton}
        >
          <Ionicons
            name={justCopied ? 'checkmark' : 'copy-outline'}
            size={15}
            color={justCopied ? codeSyntaxColors.string : codeSyntaxColors.plain}
          />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        <Text selectable style={[styles.code, { fontFamily: fontFamily.mono }]}>
          {tokens.map((token, i) => (
            <Text key={i} style={{ color: codeSyntaxColors[token.type] ?? codeSyntaxColors.plain }}>
              {token.text}
            </Text>
          ))}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 6,
    borderWidth: 1,
    borderColor: codeSyntaxColors.punctuation + '22',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF12',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  language: {
    flex: 1,
    marginStart: 10,
    fontSize: 11,
    color: codeSyntaxColors.comment,
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  copyButton: {
    padding: 2,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  code: {
    fontSize: 13,
    lineHeight: 19,
    writingDirection: 'ltr',
    textAlign: 'left',
  },
});
