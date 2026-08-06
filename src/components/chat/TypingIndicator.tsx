import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Logo } from '../common/Logo';

// The signature pulsing orb doubles as the "thinking" indicator
// instead of a generic three-dot ellipsis — one motif, reused with
// intent, rather than a second unrelated loading affordance.
export function TypingIndicator() {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <Logo size={26} pulsing />
      <Text style={[styles.label, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>
        {t('chat.thinking')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  label: {
    fontSize: 13,
    textAlign: 'auto',
  },
});
