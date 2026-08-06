import { AppSettings } from '../types';
import { StorageKeys } from './storageKeys';
import { readJSON, writeJSON } from './storage';
import {
  DEFAULT_SETTINGS_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
} from '../constants/config';

export const DEFAULT_SETTINGS: AppSettings = {
  model: DEFAULT_SETTINGS_MODEL,
  temperature: DEFAULT_TEMPERATURE,
  maxTokens: DEFAULT_MAX_TOKENS,
  themeMode: 'dark',
  language: 'ar',
  hapticsEnabled: true,
};

export async function getSettings(): Promise<AppSettings> {
  const stored = await readJSON<Partial<AppSettings>>(StorageKeys.settings, {});
  // merge onto defaults so a settings-shape upgrade (a newly added
  // field) never leaves a field undefined for existing users
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJSON(StorageKeys.settings, settings);
}

export async function getHasOnboarded(): Promise<boolean> {
  return readJSON<boolean>(StorageKeys.hasOnboarded, false);
}

export async function setHasOnboarded(value: boolean): Promise<void> {
  await writeJSON(StorageKeys.hasOnboarded, value);
}
