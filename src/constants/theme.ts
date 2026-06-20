/**
 * Design tokens from prompts/color_configs/
 * Naming follows common conventions (background, foreground, card, accent, etc.)
 */

import { Platform } from 'react-native';

export const BlockColors = {
  light: [
    '#FBACA7',
    '#FFAB82',
    '#F9CA6D',
    '#C2E388',
    '#91CEB1',
    '#98DDF0',
    '#9DC3FB',
    '#B7A7F9',
    '#EFB1E7',
  ],
  dark: [
    '#D56E67',
    '#DE865A',
    '#EBB956',
    '#92C142',
    '#5EAC86',
    '#3FB0D0',
    '#6091DB',
    '#8F7DD7',
    '#DA73CC',
  ],
} as const;

export const Colors = {
  light: {
    background: '#F5EBE1',
    foreground: '#000000',
    card: '#EEDCCA',
    secondary: '#E5D4C0',
    mutedForeground: '#6B6358',
    border: '#E0D0BC',
    accent: '#FF6600',
    accentForeground: '#FFFFFF',
    destructive: '#D56E67',
    blocks: BlockColors.light,
  },
  dark: {
    background: '#161514',
    foreground: '#CECECE',
    card: '#282522',
    secondary: '#282522',
    mutedForeground: '#9A9690',
    border: '#282522',
    accent: '#F99959',
    accentForeground: '#161514',
    destructive: '#D56E67',
    blocks: BlockColors.dark,
  },
} as const;

export type ColorScheme = keyof typeof Colors;
export type Theme = (typeof Colors)[ColorScheme];
export type ThemeColor = {
  [K in keyof Theme]: Theme[K] extends string ? K : never;
}[keyof Theme];

export type BlockIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export function getBlockColor(theme: Theme, index: BlockIndex): string {
  return theme.blocks[index];
}

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
