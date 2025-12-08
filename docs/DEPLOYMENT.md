# Cloudflare Pages デプロイメント

このドキュメントは Cloudflare Pages へのデプロイメント方法とビルド手順について記載しています。

## 概要

このプロジェクトは **Cloudflare Pages** にデプロイされています。Cloudflare Pages は Edge Runtime 上で Next.js を実行するため、従来の Node.js 環境とは異なる制約があります。

### Cloudflare Pages を選ぶ理由

- **高速:** グローバルな Cloudflare ネットワークで配信
- **スケーラブル:** 自動スケーリング対応
- **低コスト:** 無料枠が充実
- **セキュア:** DDoS 保護など標準装備

## ローカルでのビルド検証

### コマンド

```bash
# Cloudflare Pages 互換のビルドを実行
pnpm pages:build

# または（同じ）
pnpm exec next-on-pages
```

このコマンドは本番環境と同等のビルドを実行し、以下を検証します：

- Cloudflare Pages Edge Runtime との互換性
- API Route が正しく動作するか
- ミドルウェアが正しく動作するか
- 動的 import などが正しく動作するか

### 実行結果

成功時：

```
✅ next-on-pages built successfully!
```

失敗時：エラーメッセージが表示され、`pnpm exec next-on-pages` は exit code 1 で終了します。

## 設定ファイル

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Cloudflare Pages での実行を想定
  },
};

export default nextConfig;
```

### wrangler.toml（設定例）

Cloudflare Pages を使用する場合、プロジェクトルートに `wrangler.toml` を配置することで詳細な設定が可能です：

```toml
name = "calendar-front"
type = "javascript"
compatibility_date = "2024-12-01"

[build]
command = "pnpm pages:build"
```

## Edge Runtime との互換性

### ✅ サポートされている API

- `fetch` - HTTP リクエスト
- `setTimeout` / `setInterval`（制限あり）
- `crypto` API
- `Headers`, `Request`, `Response`

### ⚠️ 制限事項

以下の Node.js API は使用できません：

- ファイルシステム操作（`fs` モジュール）
- データベース直接接続（接続プーリング推奨）
- 長時間実行タスク（タイムアウト制限あり）

### ✅ 回避策

1. **ファイルシステム:** R2 (S3 互換) を使用
2. **長時間処理:** キューイングサービスを使用
3. **データベース:** 接続プーリング (Prisma など) を使用

## デプロイ手順

### GitHub を経由したデプロイ

1. **リポジトリを GitHub に push**

   ```bash
   git push origin HEAD
   ```

2. **Cloudflare Pages にリポジトリを接続**
   - Cloudflare ダッシュボード → Pages → Create project
   - GitHub リポジトリを選択
   - Build command: `pnpm pages:build`
   - Build output directory: `.next/server`

3. **自動デプロイ開始**
   - `main` ブランチへの push で自動デプロイ
   - PR に Preview URL が自動生成

### 環境変数

Cloudflare Pages の環境変数設定：

1. Pages プロジェクト → Settings → Environment variables
2. 必要な環境変数を追加
3. Development / Production を指定

```bash
# 例
NEXT_PUBLIC_API_URL=https://api.example.com
```

## トラブルシューティング

### ビルドエラー: "Module not found"

**原因:** Node.js モジュールを Edge Runtime で使用しようとしている

**解決:**

```typescript
// ❌ 使用不可
import fs from "fs";

// ✅ 代替案
import { S3Client } from "@aws-sdk/client-s3";
```

### ビルドエラー: "Unsupported syntax"

**原因:** Edge Runtime がサポートしていない TypeScript/JavaScript 構文

**解決:**

- Next.js のバージョンを確認
- `@cloudflare/next-on-pages` を最新版にアップデート

```bash
pnpm update @cloudflare/next-on-pages
```

### デプロイ後にページが 500 エラー

**原因:** ローカルテスト時は通るが、本番環境で失敗

**対策:**

1. ローカルで `pnpm pages:build` を実行して検証
2. Cloudflare ダッシュボード → Pages → Deploy logs を確認
3. Edge Runtime の制限を確認

### パフォーマンスが低下

**最適化案:**

1. **ISR (Incremental Static Regeneration) を活用**

   ```typescript
   export const revalidate = 3600; // 1 時間ごとに再生成
   ```

2. **キャッシング戦略の見直し**
   - `Cache-Control` ヘッダーを設定
   - Cloudflare のキャッシュルールを活用

3. **バンドルサイズの削減**
   - 不要な依存関係を削除
   - Code Splitting を活用

## デプロイ前チェックリスト

- [ ] `pnpm pages:build` がローカルで成功
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] 環境変数が設定されている
- [ ] PR が承認されている
- [ ] テストが通っている（あれば）

## 参考資料

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages/)
- [next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Cloudflare Workers Runtime](https://developers.cloudflare.com/workers/runtime-apis/)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-node-runtimes)
