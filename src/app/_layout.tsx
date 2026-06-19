import '../global.css';

import { ClerkProvider } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { env } from '@/constants/env';
import { FONT_ASSETS } from '@/constants/fonts';
import { Colors } from '@/constants/theme';
import { LocaleProvider } from '@/i18n/locale-provider';

SplashScreen.preventAutoHideAsync();

const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.accent,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.foreground,
    border: Colors.light.border,
    notification: Colors.light.accent,
  },
};

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.accent,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.foreground,
    border: Colors.dark.border,
    notification: Colors.dark.accent,
  },
};

if (!env.clerkPublishableKey) {
  throw new Error(
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set. Copy .env.development.example to .env and add your Clerk publishable key.',
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={env.clerkPublishableKey} tokenCache={tokenCache}>
      <LocaleProvider>
        <ThemeProvider value={colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme}>
          <Slot />
        </ThemeProvider>
      </LocaleProvider>
    </ClerkProvider>
  );
}
