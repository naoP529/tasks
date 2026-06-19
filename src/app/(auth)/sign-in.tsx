import { useSignIn } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, TextInput } from 'react-native';
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
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const handleSubmit = async () => {
    const { error } = await signIn.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
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

  if (signIn.status === 'needs_client_trust') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Verify your account
          </ThemedText>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor={theme.mutedForeground}
            onChangeText={setCode}
            keyboardType="numeric"
          />
          {errors.fields.code && (
            <ThemedText style={styles.error}>{errors.fields.code.message}</ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              fetchStatus === 'fetching' && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleVerify}
            disabled={fetchStatus === 'fetching'}>
            <ThemedText style={styles.buttonText}>Verify</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Sign in
        </ThemedText>

        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor={theme.mutedForeground}
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />

        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor={theme.mutedForeground}
          secureTextEntry
          onChangeText={setPassword}
        />
        {errors.fields.password && (
          <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
        )}
        {errors.global?.map((err) => (
          <ThemedText key={err.code} style={styles.error}>
            {err.message}
          </ThemedText>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password || fetchStatus === 'fetching') && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === 'fetching'}>
          <ThemedText style={styles.buttonText}>Continue</ThemedText>
        </Pressable>

        <ThemedView style={styles.linkRow}>
          <ThemedText>Don&apos;t have an account?</ThemedText>
          <Link href="/sign-up">
            <ThemedText type="link">Sign up</ThemedText>
          </Link>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}
