import type { AppLocale } from '@/i18n';

export type LocaleFonts = {
  /** undefined = 端末デフォルト（fontFamily を付けない） */
  sans: undefined;
  display: string;
  handwriting: string;
};

const EN_FONTS: LocaleFonts = {
  sans: undefined,
  display: 'Cagliostro_400Regular',
  handwriting: 'Caveat_400Regular',
};

const JA_FONTS: LocaleFonts = {
  sans: undefined,
  display: 'KiwiMaru_400Regular',
  handwriting: 'Yomogi_400Regular',
};

export function getFontsForLocale(locale: AppLocale): LocaleFonts {
  return locale === 'ja' ? JA_FONTS : EN_FONTS;
}
