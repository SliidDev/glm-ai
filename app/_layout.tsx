import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';

import { AppSettings } from '../src/types';
import { getSettings } from '../src/storage/settingsStorage';
import { ensureRTLMatchesLanguage } from '../src/utils/rtl';
import { translations } from '../src/constants/i18n';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ChatsProvider } from '../src/context/ChatsContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';
import { ToastView } from '../src/components/common/ToastView';
import { useTheme } from '../src/hooks/useTheme';

// Keep the native splash on screen until we've loaded fonts, read
// settings, and resolved whether a language-driven RTL reload is
// needed — otherwise the very first frame could flash the wrong
// fonts, wrong theme, or wrong text direction before snapping to the
// correct one.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [initialSettings, setInitialSettings] = useState<AppSettings | null>(null);
  const [pendingReload, setPendingReload] = useState(false);

  useEffect(() => {
    void (async () => {
      const settings = await getSettings();
      const strings = translations[settings.language].settings;

      const willReload = await ensureRTLMatchesLanguage(settings.language, {
        restartRequiredTitle: strings.restartRequiredTitle,
        restartRequiredMessage: strings.restartRequiredMessage,
        restartNow: strings.restartNow,
      });

      if (willReload) {
        // The app is about to remount from scratch (or the person was
        // asked to restart manually) — stop here rather than finish
        // bootstrapping into a layout direction we're about to leave.
        setPendingReload(true);
        return;
      }

      setInitialSettings(settings);
    })();
  }, []);

  const isReady = !pendingReload && (fontsLoaded || fontError) && initialSettings !== null;

  useEffect(() => {
    if (isReady) {
      void SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    // Native splash screen is still covering the app at this point.
    return null;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider initialSettings={initialSettings}>
            <ToastProvider>
              <ChatsProvider>
                <AppShell />
              </ChatsProvider>
            </ToastProvider>
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

/** Split out from RootLayout so useTheme() (which reads
 * SettingsContext) can be called from inside the provider tree that
 * supplies it. */
function AppShell() {
  const theme = useTheme();

  useEffect(() => {
    // Keeps the native root view (visible for an instant during
    // screen transitions, before React has painted) the same color as
    // the current theme, instead of defaulting to white.
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar style={theme.colors.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <ToastView />
    </View>
  );
}
