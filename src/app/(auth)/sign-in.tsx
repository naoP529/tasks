import { useSignIn, useSSO } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAuthStyles } from '@/components/auth-styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

function navigateAfterAuth(
  router: ReturnType<typeof useRouter>,
  decorateUrl: (url: string) => string,
) {
  const url = decorateUrl('/');
  if (url.startsWith('http') && Platform.OS === 'web') {
    window.location.href = url;
  } else {
    router.replace(url as Href);
  }
}

export default function SignInScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => createAuthStyles(theme), [theme]);
  const { signIn, errors, fetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [googleError, setGoogleError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      return;
    }

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterAuth(router, decorateUrl);
        },
      });
    } else if (signIn.status === 'needs_client_trust') {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === 'email_code',
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
      }
    }
  };

  const handleVerify = async () => {
    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === 'complete') {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterAuth(router, decorateUrl);
        },
      });
    }
  };

  const handleGoogle = async () => {
    setGoogleError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google' });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace('/');
      }
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed');
    }
  };

  if (signIn.status === 'needs_client_trust') {
    return (
      <ThemedView style={styles.screen}>
        <SafeAreaView style={styles.screen}>
          <ThemedView style={styles.logoRow}>
            <ThemedText type="handwriting" style={styles.logoText}>
              Logo here...
            </ThemedText>
          </ThemedView>
          <View style={styles.container}>
            <View style={styles.titleBlock}>
              <ThemedText type="title" style={styles.title}>
                Verify
              </ThemedText>
              <ThemedText style={styles.subtitle}>Enter the code we sent to your email</ThemedText>
            </View>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Verification code</ThemedText>
              <TextInput
                style={styles.input}
                value={code}
                placeholder="123456"
                placeholderTextColor={theme.mutedForeground}
                onChangeText={setCode}
                keyboardType="numeric"
              />
              {errors.fields.code && (
                <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
              )}
            </View>
            <View style={styles.primaryCenterRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  fetchStatus === 'fetching' && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleVerify}
                disabled={fetchStatus === 'fetching'}>
                <ThemedText type="handwriting" style={styles.primaryButtonText}>
                  Verify!
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const submitDisabled = !emailAddress || !password || fetchStatus === 'fetching';

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen}>
        <ThemedView style={styles.logoRow}>
          <ThemedText type="handwriting" style={styles.logoText}>
            Logo here...
          </ThemedText>
        </ThemedView>

        <View style={styles.container}>
          <View style={styles.titleBlock}>
            <ThemedText type="title" style={styles.title}>
              Welcome Home!
            </ThemedText>
            <ThemedText style={styles.subtitle}>Login and continue your day</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabel}>
              <View style={styles.infoIcon}>
                <ThemedText style={styles.infoIconText}>i</ThemedText>
              </View>
              <ThemedText style={styles.infoText}>Don&apos;t have account?</ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [styles.pillButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/sign-up')}>
              <ThemedText type="handwriting" style={styles.pillButtonText}>
                Sign up!
              </ThemedText>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [styles.googleButton, pressed && styles.buttonPressed]}
            onPress={handleGoogle}>
            <View style={styles.googleIcon}>
              <ThemedText style={styles.googleIconText}>G</ThemedText>
            </View>
            <ThemedText style={styles.googleButtonText}>Continue with Google</ThemedText>
          </Pressable>
          {googleError && <ThemedText style={styles.error}>{googleError}</ThemedText>}

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Mail adress</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={emailAddress}
              placeholder="Example@gmail.com"
              placeholderTextColor={theme.mutedForeground}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
            />
            {errors.fields.identifier && (
              <ThemedText style={styles.error}>{errors.fields.identifier.message}</ThemedText>
            )}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Password"
              placeholderTextColor={theme.mutedForeground}
              secureTextEntry
              onChangeText={setPassword}
            />
            {errors.fields.password && (
              <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
            )}
          </View>

          {errors.global?.map((err) => (
            <ThemedText key={err.code} style={styles.error}>
              {err.message}
            </ThemedText>
          ))}

          <View style={styles.forgotRow}>
            <View style={styles.infoIcon}>
              <ThemedText style={styles.infoIconText}>i</ThemedText>
            </View>
            <ThemedText style={styles.infoText}>Forgot password?</ThemedText>
          </View>

          <View style={styles.primaryRow}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                submitDisabled && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={submitDisabled}>
              <ThemedText type="handwriting" style={styles.primaryButtonText}>
                Login!
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
