/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ColorScheme, type Theme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useColorSchemeName(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'unspecified' ? 'light' : scheme;
}

export function useTheme(): Theme {
  return Colors[useColorSchemeName()];
}
