import { StyleSheet } from 'react-native';

import { Spacing, type Theme } from '@/constants/theme';

export function createAuthStyles(theme: Theme) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    logoRow: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
    },
    logoText: {
      fontSize: 18,
      color: theme.mutedForeground,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
    },
    titleBlock: {
      alignItems: 'center',
      marginBottom: Spacing.four,
    },
    title: {
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      marginTop: Spacing.two,
      color: theme.mutedForeground,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.three,
    },
    infoLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    infoIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: theme.mutedForeground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoIconText: {
      color: theme.mutedForeground,
      fontSize: 12,
      lineHeight: 14,
    },
    infoText: {
      color: theme.mutedForeground,
    },
    pillButton: {
      backgroundColor: theme.card,
      borderRadius: Spacing.three,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.two,
      alignItems: 'center',
    },
    pillButtonText: {
      color: theme.foreground,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.three,
      backgroundColor: '#FFFFFF',
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: Spacing.two,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.four,
      marginBottom: Spacing.three,
    },
    googleButtonText: {
      color: '#1F1F1F',
      fontSize: 16,
    },
    googleIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleIconText: {
      color: '#4285F4',
      fontWeight: '700',
      fontSize: 18,
      lineHeight: 22,
    },
    fieldGroup: {
      marginBottom: Spacing.three,
    },
    label: {
      marginBottom: Spacing.one,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      color: theme.foreground,
      borderRadius: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      fontSize: 15,
    },
    error: {
      color: theme.destructive,
      marginTop: Spacing.one,
      fontSize: 12,
    },
    forgotRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    primaryRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: Spacing.four,
    },
    primaryCenterRow: {
      alignItems: 'center',
      marginTop: Spacing.four,
    },
    primaryButton: {
      backgroundColor: theme.card,
      borderRadius: Spacing.three,
      paddingHorizontal: Spacing.five,
      paddingVertical: Spacing.two,
    },
    primaryButtonText: {
      color: theme.foreground,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
}
