/**
 * aiService classifies known failure modes (network, timeout, API
 * status:false with no message) as i18n keys like "errors.network" so
 * they render translated. If the API itself supplied a human-readable
 * message (data.message / data.error), that string is used as-is
 * since it isn't ours to translate. This one predicate is the single
 * place that decides which case a given errorMessage is.
 */
export function isTranslationKey(errorMessage: string): boolean {
  return errorMessage.startsWith('errors.');
}

export function resolveErrorMessage(
  errorMessage: string,
  translate: (key: string) => string
): string {
  if (!errorMessage) return translate('errors.unknown');
  return isTranslationKey(errorMessage) ? translate(errorMessage) : errorMessage;
}
