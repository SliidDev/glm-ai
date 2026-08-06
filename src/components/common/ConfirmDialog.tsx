import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      >
        <Pressable
          style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg }]}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text
            style={[
              styles.message,
              { color: theme.colors.textSecondary, fontFamily: theme.fontFamily.regular, fontSize: theme.fontSize.base },
            ]}
          >
            {message}
          </Text>
          <View style={styles.actions}>
            <Button
              label={cancelLabel ?? t('common.cancel')}
              variant="secondary"
              onPress={onCancel}
              style={styles.actionButton}
            />
            <Button
              label={confirmLabel ?? t('common.confirm')}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              style={styles.actionButton}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'auto',
  },
  message: {
    lineHeight: 21,
    textAlign: 'auto',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    minWidth: 96,
  },
});
