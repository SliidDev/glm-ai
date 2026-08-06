import { I18nManager, Alert } from 'react-native';
import { AppLanguage } from '../types';
import { isRTLLanguage } from '../constants/i18n';

/**
 * React Native's I18nManager.forceRTL only takes visual effect after
 * the JS bundle is reloaded — calling it mid-session flips the flag
 * but the already-mounted view tree stays in its old direction. This
 * checks whether the *native* RTL flag already matches the language
 * that should be active and, if not, flips it and reloads the app via
 * expo-updates so the new direction actually takes effect.
 *
 * Returns true if a reload was triggered (the caller should stop
 * rendering further — the app is about to remount from scratch).
 */
export async function ensureRTLMatchesLanguage(
  language: AppLanguage,
  strings: { restartRequiredTitle: string; restartRequiredMessage: string; restartNow: string }
): Promise<boolean> {
  const shouldBeRTL = isRTLLanguage(language);
  if (I18nManager.isRTL === shouldBeRTL) {
    return false;
  }

  I18nManager.allowRTL(true);
  I18nManager.forceRTL(shouldBeRTL);

  try {
    // Dynamic import: expo-updates' reloadAsync only makes sense here,
    // and importing it lazily avoids any cost for the common case
    // where no reload is needed.
    const Updates = await import('expo-updates');
    await Updates.reloadAsync();
    return true;
  } catch (err) {
    console.warn('[rtl] automatic reload failed, asking the user to restart manually', err);
    Alert.alert(strings.restartRequiredTitle, strings.restartRequiredMessage);
    return true;
  }
}
