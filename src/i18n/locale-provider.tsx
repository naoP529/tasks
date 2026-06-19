import { getLocales } from 'expo-localization';
import { createContext, useContext, useMemo, useState } from 'react';

import { getFontsForLocale, type LocaleFonts } from '@/constants/fonts-by-locale';
import i18n, { type AppLocale } from '@/i18n';

const LocaleContext = createContext<{
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, options?: object) => string;
  fonts: LocaleFonts;
} | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>(
    (getLocales()[0]?.languageCode as AppLocale) ?? 'en',
  );

  const value = useMemo(() => {
    i18n.locale = locale;
    return {
      locale,
      setLocale,
      t: (key: string, options?: object) => i18n.t(key, options),
      fonts: getFontsForLocale(locale),
    };
  }, [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
