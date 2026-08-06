import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AppSettings } from '../types';
import { DEFAULT_SETTINGS, saveSettings } from '../storage/settingsStorage';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  /** Settings loaded once during app bootstrap (see app/_layout.tsx),
   * before language/RTL is finalized — passed in rather than loaded
   * again here so there's exactly one read of storage on cold start
   * and no flash of default settings before the real ones apply. */
  initialSettings: AppSettings;
  children: React.ReactNode;
}

export function SettingsProvider({ initialSettings, children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    void saveSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
}
