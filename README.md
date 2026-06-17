# 集丸くん v1

スマホ最適化の日程調整サービスです。  
最優先は `シンプル`、`全日程参加なら1タップ`、`4言語でも迷わないUI` です。

## 技術構成

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui ベースの UI コンポーネント
- Supabase
- PostgreSQL
- Vercel
- next-intl

## 主な機能

- TOP 画面
- イベント作成
- 回答画面
- 結果画面
- 4言語対応
- ブラウザ言語の自動判定
- 言語の手動切替
- 全日程参加 1 タップ
- 全日程不参加 1 タップ
- URL コピー
- QR コード表示
- 最有力候補の自動表示
- Google / Outlook / Apple(ICS) カレンダー追加

## ディレクトリ構成

```text
src/
  app/
    [locale]/
    api/
  components/
  lib/
    db/
    i18n/
    supabase/
    utils/
    validations/
  messages/
  types/
supabase/
  schema.sql
```

## 環境変数

`.env.example` をもとに `.env.local` を作成してください。

```bash
cp .env.example .env.local
```

必要な環境変数:

- `NEXT_PUBLIC_APP_URL`
  - ローカルでは `http://localhost:3000`
  - Vercel 本番では本番 URL
- `NEXT_PUBLIC_SUPABASE_URL`
  - Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Supabase の `anon public` キー
- `SUPABASE_SERVICE_ROLE_KEY`
  - サーバー API で Supabase に安全に書き込むためのキー
  - このプロジェクトでは設定推奨

`.env.local` の例:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Supabase セットアップ

1. Supabase で新規プロジェクトを作成
2. SQL Editor で [supabase/schema.sql](/Users/hamanoryo/Documents/Codex/2026-06-17/files-mentioned-by-the-user-chatgpt/atsumarukun/supabase/schema.sql) を実行
3. Supabase ダッシュボードで `Project Settings > API` を開く
4. 以下の値を控える
   - `Project URL`
   - `anon public`
   - `service_role`
5. `.env.local` に設定する

### Supabase URL / Anon Key の確認場所

- `Project URL`
  - `Project Settings > API > Project URL`
- `Anon Key`
  - `Project Settings > API > Project API keys > anon public`
- `Service Role Key`
  - `Project Settings > API > Project API keys > service_role`

### 補足

- ブラウザ側で使う公開キーは `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- サーバー側 API で使うキーは `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しないでください
- Vercel には登録して問題ありませんが、`NEXT_PUBLIC_` を付けないでください

## ローカル起動方法

1. 依存関係をインストール

```bash
pnpm install
```

2. `.env.local` を設定

3. 開発サーバーを起動

```bash
pnpm dev
```

4. ブラウザで開く

```text
http://localhost:3000
```

## 開発時チェック

- 型チェック

```bash
pnpm typecheck
```

- ESLint

```bash
pnpm lint
```

- 本番ビルド確認

```bash
pnpm build
```

## API

- `POST /api/events`
- `GET /api/events/[id]`
- `POST /api/events/[id]/response`
- `GET /api/events/[id]/results`

## Vercel デプロイ前提の確認事項

- `package.json`
  - Node 20+ 前提
  - `packageManager` を明記
- `tsconfig.json`
  - Next.js App Router 前提の設定
- `next.config.ts`
  - `next-intl` プラグイン適用済み
- `middleware.ts`
  - 4言語のルーティングに対応
- `src/app`
  - App Router 構成
  - `TOP / 作成 / 回答 / 結果 / API` を分離済み

## Vercel デプロイ手順

まだ本番公開はせず、デプロイ可能な状態まで整える手順です。

1. GitHub に `atsumarukun` リポジトリを作成
2. このプロジェクトを push
3. Vercel で `New Project` を選択
4. `atsumarukun` リポジトリを import
5. Framework Preset が `Next.js` になっていることを確認
6. Environment Variables に以下を登録
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Preview deploy を実行
8. Preview URL 上で以下を確認
   - TOP 画面が表示される
   - 言語切替が動く
   - イベント作成画面に進める
   - Supabase 接続後、イベント作成 API が動く

## Vercel で設定すべき Environment Variables

- `NEXT_PUBLIC_APP_URL`
  - Preview では一時的に Vercel の Preview URL を設定
  - Production では本番ドメインを設定
- `NEXT_PUBLIC_SUPABASE_URL`
  - Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Supabase anon public key
- `SUPABASE_SERVICE_ROLE_KEY`
  - サーバー API 用

## 初回コミット前の整理ポイント

- `.env.local` はコミットしない
- `.env.example` はコミットする
- `pnpm-lock.yaml` はコミットする
- `public/logos/` の参考画像はそのままコミット可能
- Preview deploy で確認してから本番公開に進む
