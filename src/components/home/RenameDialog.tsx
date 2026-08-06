import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { TextField } from '../common/TextField';
import { Button } from '../common/Button';
import { isValidChatTitle } from '../../utils/validators';

interface RenameDialogProps {
  visible: boolean;
  currentTitle: string;
  onSave: (title: string) => void;
  onCancel: () => void;
}

export function RenameDialog({ visible, currentTitle, onSave, onCancel }: RenameDialogProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (visible) setTitle(currentTitle);
  }, [visible, currentTitle]);

  const canSave = isValidChatTitle(title);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityRole="button" />
        <View
          style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderRadius: theme.radius.lg }]}
        >
          <Text
            style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg }]}
          >
            {t('home.renameTitle')}
          </Text>
          <TextField
            value={title}
            onChangeText={setTitle}
            placeholder={t('home.renamePlaceholder')}
            autoFocus
            maxLength={80}
            returnKeyType="done"
            onSubmitEditing={() => canSave && onSave(title.trim())}
          />
          <View style={styles.actions}>
            <Button label={t('common.cancel')} variant="secondary" onPress={onCancel} style={styles.actionButton} />
            <Button
              label={t('common.save')}
              onPress={() => onSave(title.trim())}
              disabled={!canSave}
              style={styles.actionButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 14,
    textAlign: 'auto',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    minWidth: 96,
  },
});
