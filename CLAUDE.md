# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Critical: Expo SDK 56

This project targets **Expo SDK 56 / React Native 0.85 / React 19.2**. Many APIs changed in recent SDKs. Before writing or modifying Expo / React Native code, consult the versioned docs at https://docs.expo.dev/versions/v56.0.0/ rather than relying on prior knowledge of older SDKs.

## Commands

```bash
npm start              # expo start (Metro dev server)
npm run ios            # iOS simulator
npm run android        # Android emulator
npm run web            # Web target
npm run lint           # expo lint (ESLint via Expo)
npx expo start -c      # start with cache cleared (use after env / config changes)
```

There is **no test runner configured**. Do not invent test commands.

Environment setup: `cp .env.development.example .env` then fill in `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` and (optionally override) `EXPO_PUBLIC_API_URL`. The root layout throws at boot if the Clerk key is missing.

## Architecture

### Routing & auth gating (Expo Router, file-based)

- `src/app/_layout.tsx` — root. Wraps the tree in `ClerkProvider` (with `tokenCache` from `@clerk/expo/token-cache`) and `ThemeProvider`. Renders `<Slot />`.
- `src/app/(app)/` — **authenticated** route group. Its `_layout.tsx` reads `useAuth()` and `<Redirect href="/sign-in" />`s when not signed in. Tabs are rendered via `<AppTabs />`.
- `src/app/(auth)/` — sign-in / sign-up screens.

Typed routes are enabled (`app.json` → `experiments.typedRoutes: true`), and `reactCompiler` is also on — be aware that route hrefs are type-checked and the React Compiler may transform components.

### Data layer — three entry points, one source of truth

All BLOCKS API access flows through `src/utils/api/`. There are intentionally **three** call styles, and choosing the wrong one is the most common mistake:

| Entry point | Use from |
|---|---|
| `useApiClient()` (`src/hooks/use-api-client.ts`) | **Default for screens & hooks.** Pulls `getToken` from Clerk and memoizes a client. |
| `createApiClient({ getToken })` (`src/utils/api/create-client.ts`) | Non-React code that still needs a bound client. |
| Individual functions like `getBlocks(auth)` (`src/utils/api/{blocks,plan,repeat,schedule,user,fetch_section_data}.ts`) | TanStack Query `queryFn`, tests. |

Rule: **do not call the individual functions directly from a screen**. Go through `useApiClient()` so the JWT is attached uniformly. The README has the full `api.*` surface (`api.blocks`, `api.plans`, `api.repeat`, `api.schedule`, `api.section`, `api.user`) and TanStack Query keys live in `src/utils/api/query-keys.ts`.

Transport (`src/utils/api/client.ts`):
- `apiFetch` / `apiFetchWithQuery` — authenticated; resolve a token via `ApiAuth` (`{ token }` or `{ getToken }`), attach `Authorization: Bearer`, parse JSON or return `undefined` on 204.
- `apiFetchPublic` — no auth (used for `checkHealth`, `runMigrate`, `runMigrateAlter`).
- Non-2xx throws `ApiError(status, message)`. Catch with `instanceof ApiError` to read `err.status`.

Base URL comes from `env.apiUrl` (`src/constants/env.ts`), defaulting to `https://tasks-api-pi.vercel.app`. Backend contract: `prompts/api/README_API.md`.

### Styling

NativeWind v4 + Tailwind v3. Tailwind input is `src/global.css`, imported from the root layout. Metro is wired through `withNativeWind` (`metro.config.js`), and Babel uses `jsxImportSource: 'nativewind'` plus the `nativewind/babel` and `react-native-reanimated/plugin` (`babel.config.js`).

### Platform-specific files

Several components ship a `.web.tsx` variant alongside `.tsx` (e.g. `animated-icon`, `app-tabs`, `use-color-scheme`). Metro picks the right one per platform — when changing behavior, update both.

### Path aliases

`@/*` → `src/*`, `@/assets/*` → `assets/*` (`tsconfig.json`, `strict: true`). Prefer `@/...` imports over relative paths across the `src/` boundary.
