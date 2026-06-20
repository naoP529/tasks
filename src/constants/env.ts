const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://tasks-api-pi.vercel.app';

export const env = {
  clerkPublishableKey,
  apiUrl,
} as const;
