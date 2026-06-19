# BLOCKS (tasks)

タスク・ルーティン・予定を管理する React Native（Expo）アプリ。

Clerk で認証し、[BLOCKS API](https://tasks-api-pi.vercel.app) 経由で Neon DB にアクセスする。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フレームワーク | Expo SDK 56 / React Native 0.85 |
| ルーティング | Expo Router（file-based） |
| 認証 | Clerk (`@clerk/expo`) |
| スタイリング | NativeWind v4 + Tailwind CSS v3 |
| 言語 | TypeScript |

## セットアップ

```bash
npm install
cp .env.development.example .env
```

`.env` に以下を設定する:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_API_URL=https://tasks-api-pi.vercel.app
```

```bash
npx expo start -c
```

## プロジェクト構成

```
src/
├── app/
│   ├── _layout.tsx          # ClerkProvider（ルート）
│   ├── (app)/               # 認証必須（タブ画面）
│   └── (auth)/              # サインイン / サインアップ
├── components/
├── constants/
│   └── env.ts
├── hooks/
│   └── use-api-client.ts    # データ取得はここ経由
└── utils/
    └── api/                 # API 呼び出しレイヤー
        ├── client.ts
        ├── create-client.ts
        ├── types.ts
        ├── query-keys.ts
        └── ...
prompts/api/README_API.md    # バックエンド API 仕様書
```

## データ取得の基本ルール

**画面から API を呼ぶときは、必ず `useApiClient()` を使う。**

```tsx
import { useApiClient } from '@/hooks/use-api-client';

export function TaskPocket() {
  const api = useApiClient();

  // 取得
  const blocks = await api.section.getRemainingBlocks();

  // 更新
  await api.schedule.finish(scheduleId);
}
```

`useApiClient()` は Clerk の `getToken` を内部で束ねる。各リクエスト時に JWT が付与される。

### なぜ useApiClient か

| 方式 | 用途 |
|------|------|
| **`useApiClient()`** | **画面・Hook からの取得・更新（標準）** |
| `getBlocks({ getToken })` 等 | TanStack Query の `queryFn`、テスト |
| `createApiClient({ getToken })` | Hook を使えない非 React コード |

個別関数（`getBlocks` 等）を画面から直接呼ばない。`useApiClient()` 経由に統一する。

## 使用例

### useEffect

```tsx
import { useEffect, useState } from 'react';

import { useApiClient } from '@/hooks/use-api-client';
import type { BlockDetail } from '@/utils/api';

export function TaskPocket() {
  const api = useApiClient();
  const [blocks, setBlocks] = useState<BlockDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.section
      .getRemainingBlocks()
      .then(setBlocks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [api]);

  // ...
}
```

### カレンダー

```tsx
const api = useApiClient();

const events = await api.section.getCalendar({
  start: '2026-06-01T00:00:00Z',
  end: '2026-07-01T00:00:00Z',
});
```

### TanStack Query（後から導入する場合）

`queryFn` 内で `useApiClient` の戻り値を使う:

```tsx
import { useQuery } from '@tanstack/react-query';

import { useApiClient } from '@/hooks/use-api-client';
import { apiQueryKeys } from '@/utils/api';

function BlockList() {
  const api = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: apiQueryKeys.blocks.all,
    queryFn: () => api.blocks.getAll(),
  });

  // ...
}
```

## useApiClient の API 一覧

```typescript
const api = useApiClient();

// ユーザー
api.user.getMe()
api.user.updateMe({ name: '...' })
api.user.recordLogin()
api.user.getLoginHistory({ limit: 50, offset: 0 })

// ブロック
api.blocks.getAll()
api.blocks.getByIds(['uuid1', 'uuid2'])
api.blocks.get(id)
api.blocks.create({ name: '...', type: 'task' })
api.blocks.update(id, { name: '...' })
api.blocks.delete(id)

// プラン詳細
api.plans.get(blockId)
api.plans.create({ block_id, place_name, ... })
api.plans.update(blockId, { place_name: '...' })
api.plans.delete(blockId)

// 繰り返し
api.repeat.get(id)
api.repeat.create({ block_id, type: 'weekly', start_time: '09:00:00', ... })
api.repeat.update(id, { ... })
api.repeat.delete(id)

// スケジュール
api.schedule.getAll({ limit: 50, offset: 0 })
api.schedule.get(id)
api.schedule.create({ block_id, start_at, end_at })
api.schedule.update(id, { is_finished: true })
api.schedule.finish(id)
api.schedule.delete(id)

// 画面別取得
api.section.getCalendar({ start, end })
api.section.getRemainingBlocks()
api.section.getFinishedBlocks({ limit: 50, offset: 0 })
```

## 内部構成（参考）

```
useApiClient()
    ↓
createApiClient({ getToken })
    ↓
getBlocks(auth), getMe(auth), ...  ← src/utils/api/*.ts
    ↓
client.ts（fetch + Authorization ヘッダー）
    ↓
BLOCKS API
```

### エラーハンドリング

```typescript
import { ApiError } from '@/utils/api';

try {
  await api.blocks.getAll();
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.status);   // 401, 404, 500 など
    console.log(err.message);
  }
}
```

### TanStack Query 用 queryKey

`src/utils/api/query-keys.ts` に定義済み。導入時にそのまま使える。

```typescript
apiQueryKeys.blocks.all
apiQueryKeys.section.calendar(start, end)
apiQueryKeys.section.remainingBlocks
// ...
```

## 認証フロー

```
未ログイン → /sign-in
ログイン済み → / (タブ画面)
```

1. Clerk SDK でログイン → JWT 取得
2. `useApiClient()` が各リクエストに `Authorization: Bearer <JWT>` を付与
3. BLOCKS API が JWT を検証し DB アクセス

詳細は [`prompts/api/README_API.md`](prompts/api/README_API.md) を参照。

## スクリプト

| コマンド | 説明 |
|---------|------|
| `npm start` | 開発サーバー起動 |
| `npm run ios` | iOS シミュレータ |
| `npm run android` | Android エミュレータ |
| `npm run web` | Web |
| `npm run lint` | ESLint |

## 関連ドキュメント

- [BLOCKS API 仕様](prompts/api/README_API.md)
- [Expo ドキュメント](https://docs.expo.dev/versions/v56.0.0/)
- [Clerk Expo ガイド](https://clerk.com/docs/quickstarts/expo)
- [NativeWind ドキュメント](https://www.nativewind.dev/)
