import React, { useMemo } from 'react';
import { Text, Linking } from 'react-native';
import Markdown, { RenderRules } from 'react-native-markdown-display';
import { useTheme } from '../../hooks/useTheme';
import { CodeBlock } from './CodeBlock';

interface MarkdownMessageProps {
  content: string;
  textColor: string;
}

export function MarkdownMessage({ content, textColor }: MarkdownMessageProps) {
  const theme = useTheme();

  const rules: RenderRules = useMemo(
    () => ({
      fence: (node) => (
        <CodeBlock key={node.key} code={String(node.content ?? '')} language={node.sourceInfo || undefined} />
      ),
      code_block: (node) => <CodeBlock key={node.key} code={String(node.content ?? '')} />,
      code_inline: (node, _children, _parent, styles) => (
        <Text key={node.key} style={styles.code_inline}>
          {node.content}
        </Text>
      ),
    }),
    []
  );

  const markdownStyle = useMemo(
    () => ({
      body: {
        color: textColor,
        fontFamily: theme.fontFamily.regular,
        fontSize: theme.fontSize.base,
        lineHeight: 22,
      },
      heading1: { color: textColor, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.xl, marginTop: 10, marginBottom: 6 },
      heading2: { color: textColor, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, marginTop: 10, marginBottom: 6 },
      heading3: { color: textColor, fontFamily: theme.fontFamily.semiBold, fontSize: theme.fontSize.md, marginTop: 8, marginBottom: 4 },
      strong: { fontFamily: theme.fontFamily.bold },
      em: { fontStyle: 'italic' as const },
      link: { color: theme.colors.primary },
      paragraph: { marginTop: 0, marginBottom: 8 },
      list_item: { marginBottom: 4, flexDirection: 'row' as const },
      bullet_list_icon: { color: theme.colors.textSecondary },
      ordered_list_icon: { color: theme.colors.textSecondary },
      blockquote: {
        backgroundColor: theme.colors.surfacePressed,
        borderStartWidth: 3,
        borderStartColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginVertical: 6,
      },
      code_inline: {
        backgroundColor: theme.colors.surfacePressed,
        color: theme.colors.primary,
        fontFamily: theme.fontFamily.mono,
        fontSize: theme.fontSize.sm,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
      },
      hr: { backgroundColor: theme.colors.border, marginVertical: 10, height: 1 },
      table: { borderColor: theme.colors.border, borderWidth: 1, borderRadius: 8, marginVertical: 6 },
      th: { padding: 8, backgroundColor: theme.colors.surfacePressed, color: textColor, fontFamily: theme.fontFamily.semiBold },
      td: { padding: 8, color: textColor, borderColor: theme.colors.border },
    }),
    [theme, textColor]
  );

  return (
    <Markdown style={markdownStyle} rules={rules} onLinkPress={(url) => { void Linking.openURL(url); return false; }}>
      {content}
    </Markdown>
  );
}
