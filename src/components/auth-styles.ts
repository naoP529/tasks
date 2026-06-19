import { StyleSheet } from 'react-native';

import { Spacing, type Theme } from '@/constants/theme';

export function createAuthStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      textAlign: 'center',
      marginBottom: Spacing.two,
    },
    label: {
      marginBottom: Spacing.half,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      color: theme.foreground,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      fontSize: 16,
    },
    error: {
      color: theme.destructive,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: Spacing.two,
      paddingVertical: Spacing.three,
      alignItems: 'center',
      marginTop: Spacing.two,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    buttonText: {
      color: theme.accentForeground,
      fontWeight: '600',
    },
    linkRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Spacing.one,
      marginTop: Spacing.three,
    },
  });
}
