import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from '../hooks/useTranslation';
import { useHaptics } from '../hooks/useHaptics';
import { useSettings } from '../context/SettingsContext';
import { useChats } from '../context/ChatsContext';
import { useToast } from '../context/ToastContext';
import { ensureRTLMatchesLanguage } from '../utils/rtl';
import { importChatFromFile } from '../services/importService';
import * as chatStorage from '../storage/chatStorage';
import { findModel } from '../constants/models';
import { MIN_TEMPERATURE, MAX_TEMPERATURE, MIN_MAX_TOKENS, MAX_MAX_TOKENS, APP_CREATOR } from '../constants/config';
import { Routes } from '../navigation/routes';
import Constants from 'expo-constants';

import { ChatHeader } from '../components/chat/ChatHeader';
import { SettingsSection, SettingsRow } from '../components/settings/SettingsPrimitives';
import { SliderSetting } from '../components/settings/SliderSetting';
import { ModelSelectorModal } from '../components/settings/ModelSelectorModal';
import { ThemePicker, LanguagePicker } from '../components/settings/SettingsPickers';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export function SettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { addChat, clearAllChats } = useChats();

  const [modelModalVisible, setModelModalVisible] = useState(false);
  const [clearConfirmVisible, setClearConfirmVisible] = useState(false);
  const [resetConfirmVisible, setResetConfirmVisible] = useState(false);

  const handleLanguageChange = async (language: typeof settings.language) => {
    if (language === settings.language) return;
    haptics.selection();
    updateSettings({ language });
    await ensureRTLMatchesLanguage(language, {
      restartRequiredTitle: t('settings.restartRequiredTitle'),
      restartRequiredMessage: t('settings.restartRequiredMessage'),
      restartNow: t('settings.restartNow'),
    });
  };

  const handleImport = async () => {
    const result = await importChatFromFile();
    if (result.status === 'cancelled') return;
    if (result.status === 'invalid') {
      showToast(t('settings.importError'), 'error');
      return;
    }
    await chatStorage.saveMessages(result.chat.id, result.messages);
    await addChat(result.chat);
    showToast(t('settings.importSuccess'), 'success');
    router.push(Routes.chat(result.chat.id));
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <>
      <ChatHeader title={t('settings.title')} onBack={() => router.back()} />
      <ScrollView
        style={{ backgroundColor: theme.colors.background }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <SettingsSection title={t('settings.modelSection')}>
          <SettingsRow
            icon="hardware-chip-outline"
            label={t('settings.model')}
            value={findModel(settings.model).label}
            onPress={() => setModelModalVisible(true)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.generationSection')}>
          <SliderSetting
            label={t('settings.temperature')}
            hint={t('settings.temperatureHint')}
            value={settings.temperature}
            minimumValue={MIN_TEMPERATURE}
            maximumValue={MAX_TEMPERATURE}
            step={0.1}
            displayValue={settings.temperature.toFixed(1)}
            onValueChange={(v) => updateSettings({ temperature: Number(v.toFixed(1)) })}
          />
          <SliderSetting
            label={t('settings.maxTokens')}
            hint={t('settings.maxTokensHint')}
            value={settings.maxTokens}
            minimumValue={MIN_MAX_TOKENS}
            maximumValue={MAX_MAX_TOKENS}
            step={100}
            displayValue={`${settings.maxTokens}`}
            onValueChange={(v) => updateSettings({ maxTokens: Math.round(v) })}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.appearanceSection')}>
          <ThemePicker
            value={settings.themeMode}
            onChange={(themeMode) => updateSettings({ themeMode })}
            labels={{ dark: t('settings.themeDark'), light: t('settings.themeLight'), system: t('settings.themeSystem') }}
          />
          <LanguagePicker
            value={settings.language}
            onChange={(lang) => void handleLanguageChange(lang)}
            labels={{ ar: t('settings.languageArabic'), en: t('settings.languageEnglish') }}
          />
        </SettingsSection>

        <SettingsSection title={t('settings.hapticsSection')}>
          <SettingsRow
            icon="phone-portrait-outline"
            label={t('settings.haptics')}
            subtitle={t('settings.hapticsHint')}
            toggleValue={settings.hapticsEnabled}
            onToggle={(v) => updateSettings({ hapticsEnabled: v })}
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.dataSection')}>
          <SettingsRow icon="download-outline" label={t('settings.importChat')} onPress={() => void handleImport()} />
          <SettingsRow
            icon="trash-outline"
            label={t('settings.clearHistory')}
            onPress={() => setClearConfirmVisible(true)}
            destructive
            isLast
          />
        </SettingsSection>

        <SettingsSection title={t('settings.aboutSection')}>
          <SettingsRow icon="information-circle-outline" label={t('settings.aboutVersion')} value={appVersion} />
          <SettingsRow icon="person-outline" label={t('settings.aboutCreator')} value={APP_CREATOR} />
          <SettingsRow
            icon="refresh-outline"
            label={t('settings.resetDefaults')}
            onPress={() => setResetConfirmVisible(true)}
            isLast
          />
        </SettingsSection>

        <Text style={[styles.footerNote, { color: theme.colors.textMuted, fontFamily: theme.fontFamily.regular }]}>
          {`${t('common.appName')} · ${appVersion}`}
        </Text>
      </ScrollView>

      <ModelSelectorModal
        visible={modelModalVisible}
        currentModel={settings.model}
        onSelect={(model) => updateSettings({ model })}
        onClose={() => setModelModalVisible(false)}
      />

      <ConfirmDialog
        visible={clearConfirmVisible}
        title={t('settings.clearHistoryConfirmTitle')}
        message={t('settings.clearHistoryConfirmMessage')}
        destructive
        confirmLabel={t('common.delete')}
        onCancel={() => setClearConfirmVisible(false)}
        onConfirm={() => {
          setClearConfirmVisible(false);
          haptics.success();
          void clearAllChats();
          showToast(t('settings.cleared'), 'success');
        }}
      />

      <ConfirmDialog
        visible={resetConfirmVisible}
        title={t('settings.resetDefaults')}
        message={t('settings.resetDefaultsConfirm')}
        confirmLabel={t('common.confirm')}
        onCancel={() => setResetConfirmVisible(false)}
        onConfirm={() => {
          setResetConfirmVisible(false);
          resetSettings();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 12,
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 4,
  },
});
