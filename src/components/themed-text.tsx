import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import type { LocaleFonts } from '@/constants/fonts-by-locale';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n/locale-provider';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | 'handwriting';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const { fonts } = useLocale();
  const fontFamily = getFontFamily(type, fonts);

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'foreground'] },
        fontFamily != null && { fontFamily },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && [styles.link, { color: theme.accent }],
        type === 'linkPrimary' && [styles.linkPrimary, { color: theme.accent }],
        type === 'code' && styles.code,
        type === 'handwriting' && styles.handwriting,
        style,
      ]}
      {...rest}
    />
  );
}

function getFontFamily(
  type: NonNullable<ThemedTextProps['type']>,
  fonts: LocaleFonts,
): TextStyle['fontFamily'] {
  if (type === 'code') {
    return undefined;
  }
  if (type === 'title' || type === 'subtitle') {
    return fonts.display;
  }
  if (type === 'handwriting') {
    return fonts.handwriting;
  }
  return fonts.sans;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
  },
  handwriting: {
    fontSize: 20,
    lineHeight: 28,
  },
  code: {
    fontFamily: Platform.select({
      web: 'var(--font-mono)',
      ios: 'Menlo',
      default: 'monospace',
    }),
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
