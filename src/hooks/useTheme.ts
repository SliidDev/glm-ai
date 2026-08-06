import { useColorScheme } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { resolveTheme, ResolvedTheme } from '../constants/theme';

export function useTheme(): ResolvedTheme {
  const { settings } = useSettings();
  const systemScheme = useColorScheme();

  const mode =
    settings.themeMode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : settings.themeMode;

  return resolveTheme(mode);
}
