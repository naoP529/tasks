import { useAuth, useSignUp, useSSO } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createAuthStyles } from '@/components/auth-styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useApiClient } from '@/hooks/use-api-client';
import { useTheme } from '@/hooks/use-theme';

const USERNAME_RE = /^[A-Za-z0-9_.-]+$/;
const PASSWORD_LETTER = /[A-Za-z]/;
const PASSWORD_DIGIT = /[0-9]/;
const PASSWORD_SYMBOL = /[^A-Za-z0-9]/;

function validateUsername(value: string): string | null {
  if (!value) return 'Username is required';
  if (!USERNAME_RE.test(value)) {
    return 'Username cannot contain spaces or special characters';
  }
  return null;
}

function validatePassword(value: string): string | null {
  if (!value) return 'Password is required';
  if (!PASSWORD_LETTER.test(value)) return 'Password must include at least one letter';
  if (!PASSWORD_DIGIT.test(value)) return 'Password must include at least one digit';
  if (!PASSWORD_SYMBOL.test(value)) return 'Password must include at least one symbol';
  return null;
}

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

export default function SignUpScreen() {
  const theme = useTheme();
  const styles = React.useMemo(() => createAuthStyles(theme), [theme]);
  const { signUp, errors, fetchStatus } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const api = useApiClient();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [code, setCode] = React.useState('');
  const [localErrors, setLocalErrors] = React.useState<{
    username?: string | null;
    password?: string | null;
  }>({});
  const [googleError, setGoogleError] = React.useState<string | null>(null);

  const registerInDb = React.useCallback(async () => {
    try {
      await api.user.recordLogin();
    } catch (err) {
      console.error('Failed to register user in DB', err);
    }
  }, [api]);

  const handleSubmit = async () => {
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    setLocalErrors({ username: usernameError, password: passwordError });
    if (usernameError || passwordError) return;

    const { error } = await signUp.password({ emailAddress, password, username });
    if (error) {
      return;
    }

    await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({ code });

    if (signUp.status === 'complete') {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterAuth(router, decorateUrl);
        },
      });
      await registerInDb();
    }
  };

  const handleGoogle = async () => {
    setGoogleError(null);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy: 'oauth_google' });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        await registerInDb();
        router.replace('/');
      }
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-up failed');
    }
  };

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  const usernameMessage = localErrors.username ?? errors.fields.username?.message ?? null;
  const passwordMessage = localErrors.password ?? errors.fields.password?.message ?? null;
  const emailMessage = errors.fields.emailAddress?.message ?? null;

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
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
            <View style={styles.primaryCenterRow}>
              <Pressable onPress={() => signUp.verifications.sendEmailCode()}>
                <ThemedText style={styles.infoText}>Resend code</ThemedText>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const submitDisabled = !emailAddress || !password || !username || fetchStatus === 'fetching';

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
              Register
            </ThemedText>
            <ThemedText style={styles.subtitle}>Sign up with Google or password</ThemedText>
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
            {emailMessage && <ThemedText style={styles.error}>{emailMessage}</ThemedText>}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Password"
              placeholderTextColor={theme.mutedForeground}
              secureTextEntry
              onChangeText={(v) => {
                setPassword(v);
                if (localErrors.password) {
                  setLocalErrors((prev) => ({ ...prev, password: validatePassword(v) }));
                }
              }}
            />
            {passwordMessage && <ThemedText style={styles.error}>{passwordMessage}</ThemedText>}
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Username</ThemedText>
            <TextInput
              style={styles.input}
              autoCapitalize="none"
              value={username}
              placeholder="Username"
              placeholderTextColor={theme.mutedForeground}
              onChangeText={(v) => {
                setUsername(v);
                if (localErrors.username) {
                  setLocalErrors((prev) => ({ ...prev, username: validateUsername(v) }));
                }
              }}
            />
            {usernameMessage && <ThemedText style={styles.error}>{usernameMessage}</ThemedText>}
          </View>

          {errors.global?.map((err) => (
            <ThemedText key={err.code} style={styles.error}>
              {err.message}
            </ThemedText>
          ))}

          <View style={styles.primaryCenterRow}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                submitDisabled && styles.buttonDisabled,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSubmit}
              disabled={submitDisabled}>
              <ThemedText type="handwriting" style={styles.primaryButtonText}>
                Sign up!
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.infoText}>Already have an account?</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.pillButton, pressed && styles.buttonPressed]}
              onPress={() => router.push('/sign-in')}>
              <ThemedText type="handwriting" style={styles.pillButtonText}>
                Login!
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
