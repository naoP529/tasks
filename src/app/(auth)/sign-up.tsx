import { useAuth, useSignUp } from '@clerk/expo';
import { type Href, Link, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authStyles as styles } from '@/components/auth-styles';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

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
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) {
      await signUp.verifications.sendEmailCode();
    }
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
    }
  };

  if (signUp.status === 'complete' || isSignedIn) {
    return null;
  }

  if (
    signUp.status === 'missing_requirements' &&
    signUp.unverifiedFields.includes('email_address') &&
    signUp.missingFields.length === 0
  ) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Verify your email
          </ThemedText>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Enter verification code"
            placeholderTextColor="#666666"
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
          <Pressable onPress={() => signUp.verifications.sendEmailCode()}>
            <ThemedText type="link">Resend code</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Sign up
        </ThemedText>

        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#666666"
          onChangeText={setEmailAddress}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <ThemedText style={styles.error}>{errors.fields.emailAddress.message}</ThemedText>
        )}

        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={styles.input}
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#666666"
          secureTextEntry
          onChangeText={setPassword}
        />
        {errors.fields.password && (
          <ThemedText style={styles.error}>{errors.fields.password.message}</ThemedText>
        )}

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
          <ThemedText>Already have an account?</ThemedText>
          <Link href="/sign-in">
            <ThemedText type="link">Sign in</ThemedText>
          </Link>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}
