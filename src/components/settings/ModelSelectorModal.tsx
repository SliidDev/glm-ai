import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';
import { AI_MODELS } from '../../constants/models';
import { TextField } from '../common/TextField';
import { Button } from '../common/Button';

interface ModelSelectorModalProps {
  visible: boolean;
  currentModel: string;
  onSelect: (modelId: string) => void;
  onClose: () => void;
}

export function ModelSelectorModal({ visible, currentModel, onSelect, onClose }: ModelSelectorModalProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [customModel, setCustomModel] = useState('');

  const isKnownModel = AI_MODELS.some((m) => m.id === currentModel);

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
          <Text style={[styles.title, { color: theme.colors.text, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg }]}>
            {t('settings.chooseModel')}
          </Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {AI_MODELS.map((model) => {
              const selected = model.id === currentModel;
              return (
                <Pressable
                  key={model.id}
                  onPress={() => {
                    onSelect(model.id);
                    onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={model.label}
                  accessibilityState={{ selected }}
                  style={[styles.row, selected && { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md }]}
                >
                  <View style={styles.rowText}>
                    <Text style={[styles.modelLabel, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold }]}>
                      {model.label}
                    </Text>
                    <Text style={[styles.modelDescription, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]} numberOfLines={1}>
                      {model.description}
                    </Text>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />}
                </Pressable>
              );
            })}

            <View style={styles.customSection}>
              <Text style={[styles.customLabel, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.semiBold }]}>
                {t('common.custom')}
              </Text>
              {!isKnownModel && (
                <View style={[styles.row, { backgroundColor: theme.colors.primarySoft, borderRadius: theme.radius.md }]}>
                  <Text style={[styles.modelLabel, { color: theme.colors.text, fontFamily: theme.fontFamily.semiBold, flex: 1 }]}>
                    {currentModel}
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                </View>
              )}
              <View style={styles.customRow}>
                <View style={styles.customInput}>
                  <TextField
                    value={customModel}
                    onChangeText={setCustomModel}
                    placeholder={t('settings.customModelPlaceholder')}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Button
                  label={t('settings.useCustomModel')}
                  size="sm"
                  disabled={customModel.trim().length === 0}
                  onPress={() => {
                    onSelect(customModel.trim());
                    setCustomModel('');
                    onClose();
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
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
  title: {
    marginBottom: 12,
    textAlign: 'auto',
  },
  list: {
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  rowText: {
    flex: 1,
  },
  modelLabel: {
    fontSize: 15,
    textAlign: 'auto',
  },
  modelDescription: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'auto',
  },
  customSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#80808033',
  },
  customLabel: {
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
    textAlign: 'auto',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
  },
});
