# BLOCKS API

タスク・ルーティン・予定を管理するアプリ「BLOCKS」のバックエンドAPI。
React Native（Expo）製のネイティブアプリから Neon DB に安全にアクセスするための経由地として機能する。

---

## 目次

1. [構成概要](#構成概要)
2. [認証の仕組み](#認証の仕組み)
3. [リクエストの基本ルール](#リクエストの基本ルール)
4. [エンドポイント一覧](#エンドポイント一覧)
5. [各エンドポイントの使い方](#各エンドポイントの使い方)
   - [ヘルスチェック・マイグレーション](#ヘルスチェック・マイグレーション)
   - [ユーザー](#ユーザー)
   - [ブロック (blocks)](#ブロック-blocks)
   - [プラン詳細 (plans)](#プラン詳細-plans)
   - [繰り返し (repeat)](#繰り返し-repeat)
   - [スケジュール (schedule)](#スケジュール-schedule)
   - [画面別取得用](#画面別取得用)
   - [ログイン履歴 (login)](#ログイン履歴-login)
6. [エラーレスポンス](#エラーレスポンス)
7. [開発の流れ](#開発の流れ)

---

## 構成概要

```
[ネイティブアプリ (React Native)]
        │
        │ ① ログイン・サインアップは Clerk と直接やり取り
        ↓
   [Clerk (認証SaaS)]
        │
        │ ② Clerk が発行する JWT (アクセストークン) を保存
        ↓
[ネイティブアプリ]
        │
        │ ③ JWT を Authorization ヘッダーに付けて API を叩く
        ↓
   [このNext.js API] ← JWT を検証
        │
        │ ④ ユーザー確認後、DB を読み書き
        ↓
    [Neon (PostgreSQL)]
```

- **Clerk**: サインアップ・ログイン・パスワード管理を担当する外部サービス
- **Next.js API**: 認証チェックと DB アクセスの中継地
- **Neon**: サーバレス PostgreSQL データベース

---

## 認証の仕組み

### 基本フロー

1. **アプリ側**: Clerk SDK でログインし、JWT (アクセストークン) を取得
2. **アプリ側**: API へのリクエストに `Authorization: Bearer <JWT>` を付与
3. **API 側**: `proxy.ts` がリクエストを受信し、JWT を検証
4. **API 側**: JWT が有効なら、ユーザーIDを使って DB アクセスを許可

### 公開エンドポイント（認証不要）

以下のエンドポイントは認証なしでアクセス可能：

- `/api/health` — DB 疎通確認
- `/api/migrate` — テーブル初期作成（開発用）
- `/api/migrate/alter` — スキーマ変更適用（開発用）
- `/api/webhooks/clerk` — Clerk からの Webhook 受信

それ以外の全エンドポイントは認証必須。

### React Native 側のサンプル

```typescript
import { useAuth } from "@clerk/clerk-expo";

function MyComponent() {
  const { getToken } = useAuth();

  const fetchTasks = async () => {
    const token = await getToken();  // Clerk から JWT を取得
    const res = await fetch("https://tasks-api-pi.vercel.app/api/blocks", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return await res.json();
  };
}
```

---

## リクエストの基本ルール

| 項目 | 内容 |
|---|---|
| 日時形式 | ISO 8601（UTC）。例: `2026-06-14T09:00:00Z` |
| 日付形式 | `YYYY-MM-DD`。例: `2026-06-14` |
| 時刻形式 | `HH:MM:SS`。例: `09:30:00` |
| ID | UUID形式（`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`） |
| Content-Type | `application/json` |
| 認可 | 自分（認証ユーザー）のデータのみ操作可能 |

PATCH エンドポイントでは、**渡したフィールドのみ更新**される。
省略したフィールドは変更されない。

---

## エンドポイント一覧

### システム系

| メソッド | パス | 説明 | 認証 |
|---|---|---|---|
| GET | `/api/health` | DB疎通確認 | 不要 |
| POST | `/api/migrate` | テーブル初期作成 | 不要 |
| POST | `/api/migrate/alter` | スキーマ変更適用 | 不要 |
| POST | `/api/webhooks/clerk` | Clerk Webhook受信 | 不要（署名検証あり） |

### ユーザー

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/users/me` | 自分のプロフィール取得 |
| PATCH | `/api/users/me` | 自分のプロフィール更新 |

### ブロック (blocks)

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/blocks` | 自分の全ブロック取得 |
| GET | `/api/blocks?ids=uuid1,uuid2` | 指定ID群を詳細（plan/repeat付き）取得 |
| POST | `/api/blocks` | ブロック作成 |
| GET | `/api/blocks/[id]` | 単体ブロック取得 |
| PATCH | `/api/blocks/[id]` | ブロック更新 |
| DELETE | `/api/blocks/[id]` | ブロック削除（関連データも削除） |

### プラン詳細 (plans)

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/plans` | プラン詳細作成 |
| GET | `/api/plans/[blockId]` | プラン詳細取得 |
| PATCH | `/api/plans/[blockId]` | プラン詳細更新 |
| DELETE | `/api/plans/[blockId]` | プラン詳細削除 |

### 繰り返し (repeat)

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/repeat` | 繰り返しルール作成 |
| GET | `/api/repeat/[id]` | 繰り返しルール取得 |
| PATCH | `/api/repeat/[id]` | 繰り返しルール更新 |
| DELETE | `/api/repeat/[id]` | 繰り返しルール削除 |

### スケジュール (schedule)

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/schedule` | スケジュール一覧 |
| POST | `/api/schedule` | スケジュール作成 |
| GET | `/api/schedule/[id]` | 単体スケジュール取得 |
| PATCH | `/api/schedule/[id]` | スケジュール更新（完了マークもこれ） |
| DELETE | `/api/schedule/[id]` | スケジュール削除 |

### 画面別取得用

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/calendar` | カレンダー表示用（期間指定） |
| GET | `/api/remaining_blocks` | タスクポケット用（未配置） |
| GET | `/api/finished_blocks` | 完了済み一覧（done_pile） |

### ログイン履歴

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/login` | ログイン履歴取得 |
| POST | `/api/login` | ログイン記録 |

---

## 各エンドポイントの使い方

> 以下の例では `https://tasks-api-pi.vercel.app` を本番URLとする。
> `<TOKEN>` は Clerk から取得した JWT に置き換えること。

### ヘルスチェック・マイグレーション

#### `GET /api/health`

DBに接続できているか確認する。アプリ起動時のヘルスチェック等に使う。

```bash
curl https://tasks-api-pi.vercel.app/api/health
```

レスポンス:
```json
{ "status": "ok" }
```

#### `POST /api/migrate`

データベースに必要なテーブルを作成する（初回のみ実行）。

```bash
curl -X POST https://tasks-api-pi.vercel.app/api/migrate
```

#### `POST /api/migrate/alter`

スキーマ変更（カラム追加など）を適用する。

```bash
curl -X POST https://tasks-api-pi.vercel.app/api/migrate/alter
```

---

### ユーザー

#### `GET /api/users/me`

自分のプロフィールを取得する。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://tasks-api-pi.vercel.app/api/users/me
```

レスポンス:
```json
{
  "id": "24ad72f0-3883-4bd1-af8...",
  "provider_user_id": "user_2g7np7Hrk0SN6kj5E...",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-06-13T14:00:27.720Z"
}
```

#### `PATCH /api/users/me`

自分の名前やメールを更新する。

```bash
curl -X PATCH -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "新しい名前"}' \
  https://tasks-api-pi.vercel.app/api/users/me
```

更新可能なフィールド: `name`, `email`

---

### ブロック (blocks)

「ブロック」はタスク・ルーティン・予定の親エンティティ。
`type` で 3 種類を区別する。

| type | 用途 |
|---|---|
| `routine` | 毎日のルーティン |
| `task` | 単発のタスク |
| `plan` | 予定（場所付き） |

#### `GET /api/blocks`

自分の全ブロックを取得する（プレーンな配列）。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://tasks-api-pi.vercel.app/api/blocks
```

レスポンス:
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "朝のジョギング",
    "description": "",
    "is_repeated": true,
    "type": "routine",
    "default_duration": 30
  }
]
```

#### `GET /api/blocks?ids=uuid1,uuid2`

複数のブロックを **plan と repeat を結合して** まとめて取得する。
詳細画面や編集画面で使う。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://tasks-api-pi.vercel.app/api/blocks?ids=uuid1,uuid2"
```

レスポンス:
```json
[
  {
    "block_id": "uuid",
    "name": "ジムに行く",
    "description": "週3回",
    "default_duration": 90,
    "type": "plan",
    "is_repeated": true,
    "plan": {
      "place_name": "Anytime Fitness",
      "place_lat": "35.681236",
      "place_lng": "139.767125"
    },
    "repeat": {
      "repeat_id": "uuid",
      "type": "weekly",
      "start_time": "19:00:00",
      "day_of_the_week": [1, 3, 5],
      "day_of_the_month": null,
      "month": null,
      "end_date": null
    }
  }
]
```

#### `POST /api/blocks`

新しいブロックを作成する。

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "資格の勉強",
    "type": "task",
    "description": "毎日30分",
    "default_duration": 30
  }' \
  https://tasks-api-pi.vercel.app/api/blocks
```

リクエストボディ:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| name | string | ✓ | ブロック名 |
| type | string | ✓ | `routine` / `task` / `plan` |
| description | string |  | 説明（既定 `""`） |
| is_repeated | boolean |  | 繰り返しかどうか（既定 `false`） |
| default_duration | int |  | デフォルト所要時間（分） |

レスポンス（201）: 作成された blocks レコード全体

#### `GET /api/blocks/[id]`

単体のブロックを取得する。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://tasks-api-pi.vercel.app/api/blocks/uuid
```

#### `PATCH /api/blocks/[id]`

ブロックの情報を部分更新する。

```bash
curl -X PATCH -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "新しい名前", "default_duration": 60}' \
  https://tasks-api-pi.vercel.app/api/blocks/uuid
```

更新可能: `name`, `description`, `is_repeated`, `default_duration`, `type`

#### `DELETE /api/blocks/[id]`

ブロックを削除する。**関連する plans / repeat / schedule も連鎖削除される**ので注意。

```bash
curl -X DELETE -H "Authorization: Bearer <TOKEN>" \
  https://tasks-api-pi.vercel.app/api/blocks/uuid
```

---

### プラン詳細 (plans)

`type: "plan"` のブロックに、場所情報を追加する。
blocks と 1:1 の関係（block_id が主キー）。

#### `POST /api/plans`

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "block_id": "uuid",
    "place_name": "東京駅",
    "place_lat": 35.681236,
    "place_lng": 139.767125
  }' \
  https://tasks-api-pi.vercel.app/api/plans
```

リクエストボディ:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| block_id | uuid | ✓ | 紐づけるブロックID |
| place_name | string | ✓ | 場所名 |
| place_lat | decimal |  | 緯度（小数点6桁まで） |
| place_lng | decimal |  | 経度 |

#### `GET /api/plans/[blockId]` / `PATCH` / `DELETE`

操作対象は `block_id`。更新可能フィールドは `place_name`, `place_lat`, `place_lng`。

---

### 繰り返し (repeat)

ブロックに繰り返しルールを設定する。

#### `POST /api/repeat`

このエンドポイントは作成と同時に `blocks.is_repeated` を `true` にする。

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "block_id": "uuid",
    "type": "weekly",
    "start_time": "09:00:00",
    "day_of_the_week": [1, 3, 5]
  }' \
  https://tasks-api-pi.vercel.app/api/repeat
```

リクエストボディ:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| block_id | uuid | ✓ | 紐づけるブロックID |
| type | string | ✓ | `daily` / `weekly` / `monthly` / `yearly` |
| start_time | time | ✓ | 開始時刻 `HH:MM:SS` |
| day_of_the_week | int[] |  | weekly用 例: `[1,3,5]` = 月水金 |
| day_of_month | int |  | monthly用 例: `15` |
| month | int |  | yearly用 例: `4` (4月) |
| end_date | date |  | 繰り返し終了日 `YYYY-MM-DD` |

#### `GET /api/repeat/[id]` / `PATCH` / `DELETE`

`DELETE` 時は `blocks.is_repeated` を `false` に戻す。

---

### スケジュール (schedule)

ブロックを実際の日時に配置したインスタンス。
同じブロックを複数の日時にスケジュールできる。

#### `POST /api/schedule`

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "block_id": "uuid",
    "start_at": "2026-06-15T09:00:00Z",
    "end_at": "2026-06-15T10:00:00Z"
  }' \
  https://tasks-api-pi.vercel.app/api/schedule
```

リクエストボディ:

| フィールド | 型 | 必須 | 説明 |
|---|---|---|---|
| block_id | uuid | ✓ | 紐づけるブロックID |
| start_at | datetime |  | 開始日時（未配置時は省略可） |
| end_at | datetime |  | 終了日時 |
| deadline | datetime |  | 締切（タスク用） |
| repeat_id | uuid |  | 繰り返しルール由来の場合 |

#### `GET /api/schedule`

自分の全スケジュールを取得（ページング対応）。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://tasks-api-pi.vercel.app/api/schedule?limit=50&offset=0"
```

#### `PATCH /api/schedule/[id]` — 完了マークもこれを使う

```bash
# 完了にする（finished_at は自動でセット）
curl -X PATCH -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"is_finished": true}' \
  https://tasks-api-pi.vercel.app/api/schedule/uuid
```

`is_finished: true` を送ると、`finished_at` が現在時刻で自動セットされる。
明示的に `finished_at` を指定すればその値が使われる。

更新可能: `start_at`, `end_at`, `deadline`, `is_finished`, `finished_at`

#### `DELETE /api/schedule/[id]`

スケジュールを削除する（ブロック本体は残る）。

---

### 画面別取得用

UI画面ごとに最適化された専用エンドポイント。

#### `GET /api/calendar?start=...&end=...`

カレンダー表示用。指定期間内の予定をブロック情報付きで返す。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://tasks-api-pi.vercel.app/api/calendar?start=2026-06-01T00:00:00Z&end=2026-07-01T00:00:00Z"
```

クエリパラメータ:

| 名前 | 必須 | 説明 |
|---|---|---|
| start | ✓ | 期間開始（含む） |
| end | ✓ | 期間終了（未満） |

制約: 期間は最大 3ヶ月まで。`start_at` または `deadline` が範囲内のものを返す。

#### `GET /api/remaining_blocks`

タスクポケット（未配置のタスク・全ルーティン）を取得する。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  https://tasks-api-pi.vercel.app/api/remaining_blocks
```

#### `GET /api/finished_blocks?limit=50&offset=0`

完了済みスケジュールの累積一覧（新しい順）。

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://tasks-api-pi.vercel.app/api/finished_blocks?limit=50&offset=0"
```

レスポンス:
```json
{
  "total": 128,
  "items": [
    {
      "id": "uuid",
      "deadline": null,
      "finished_at": "2026-06-14T08:00:00Z",
      "name": "朝のジョギング",
      "type": "routine"
    }
  ]
}
```

---

### ログイン履歴 (login)

#### `POST /api/login`

ログイン記録を残す。アプリ起動時に呼ぶ想定。

```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://tasks-api-pi.vercel.app/api/login
```

ボディは空でOK。省略時は `date = 今日`、`logged_in_at = 現在時刻` がセットされる。

#### `GET /api/login`

```bash
curl -H "Authorization: Bearer <TOKEN>" \
  "https://tasks-api-pi.vercel.app/api/login?limit=50&offset=0"
```

---

## エラーレスポンス

| ステータス | 意味 | 主な原因 |
|---|---|---|
| 200 | 成功 | - |
| 201 | 作成成功 | POST 成功時 |
| 400 | リクエスト不正 | 必須パラメータ欠落、型不一致など |
| 401 | 未認証 | JWT 未付与、JWT 無効 |
| 404 | リソース未発見 | 該当データなし、他人のデータへアクセス |
| 500 | サーバーエラー | DB接続失敗など |

エラー時のレスポンス形式:
```json
{ "error": "エラーメッセージ" }
```

---

## 開発の流れ

### ローカル開発

```bash
# 依存インストール
npm install

# 開発サーバー起動
npm run dev
```

`.env.local` に以下を設定:
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
```

### デプロイ

Vercel にデプロイ後、同じ環境変数を Vercel Dashboard の Environment Variables に設定する。

### スキーマ変更時

1. `lib/schema.ts` に新規テーブル定義を追加
2. `app/api/migrate/alter/route.ts` に `ALTER TABLE` 文を追加
3. デプロイ後に `POST /api/migrate/alter` を叩いて適用

---

## 技術スタック

- Next.js 16 (App Router)
- TypeScript
- Clerk (認証)
- Neon (PostgreSQL, serverless driver)
- svix (Webhook署名検証)
- Vercel (ホスティング)
