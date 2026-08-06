import en from './en';
import ar from './ar';
import { AppLanguage } from '../../types';
import type { TranslationSchema } from './en';

export const translations: Record<AppLanguage, TranslationSchema> = { en, ar };

export const RTL_LANGUAGES: AppLanguage[] = ['ar'];

export function isRTLLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

export type { TranslationSchema } from './en';
