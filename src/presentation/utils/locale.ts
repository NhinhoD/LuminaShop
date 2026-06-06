export function getLocalizedText(field: Record<string, string> | string | undefined | null, locale: 'vi' | 'en'): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field[locale] || field['vi'] || field['en'] || '';
}
