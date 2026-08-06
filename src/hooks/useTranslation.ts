import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { translations, isRTLLanguage } from '../constants/i18n';

type Params = Record<string, string | number>;

function getByPath(obj: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
      obj
    );
}

function collectKeyPaths(obj: unknown, prefix = ''): string[] {
  if (!obj || typeof obj !== 'object') return [prefix];
  return Object.entries(obj as Record<string, unknown>).flatMap(([key, value]) =>
    collectKeyPaths(value, prefix ? `${prefix}.${key}` : key)
  );
}

export function useTranslation() {
  const { settings } = useSettings();
  const language = settings.language;
  const dict = translations[language];
  const warnedRef = useRef(false);

  // Dev-only sanity check: catches a key added to en.ts but forgotten
  // in ar.ts (or vice versa) as soon as the app runs, instead of only
  // when someone happens to view that screen in that language.
  useEffect(() => {
    if (!__DEV__ || warnedRef.current) return;
    warnedRef.current = true;
    const enKeys = new Set(collectKeyPaths(translations.en));
    const arKeys = new Set(collectKeyPaths(translations.ar));
    const missingInAr = [...enKeys].filter((k) => !arKeys.has(k));
    const missingInEn = [...arKeys].filter((k) => !enKeys.has(k));
    if (missingInAr.length) console.warn('[i18n] missing in ar.ts:', missingInAr);
    if (missingInEn.length) console.warn('[i18n] missing in en.ts:', missingInEn);
  }, []);

  const t = useCallback(
    (key: string, params?: Params) => {
      const value = getByPath(dict, key);
      let text = typeof value === 'string' ? value : key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    },
    [dict]
  );

  return { t, language, isRTL: isRTLLanguage(language) };
}
