import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';

/** Every haptic call in the app should go through here rather than
 * calling expo-haptics directly, so the "haptics" setting toggle
 * actually controls every single one of them from one place. */
export function useHaptics() {
  const { settings } = useSettings();
  const enabled = settings.hapticsEnabled;

  const light = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [enabled]);

  const medium = useCallback(() => {
    if (enabled) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [enabled]);

  const success = useCallback(() => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [enabled]);

  const error = useCallback(() => {
    if (enabled) void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, [enabled]);

  const selection = useCallback(() => {
    if (enabled) void Haptics.selectionAsync();
  }, [enabled]);

  return { light, medium, success, error, selection };
}
