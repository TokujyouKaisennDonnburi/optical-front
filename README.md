# Calendar Front

OptiCal のフロントエンドリポジトリです。

## 📋 目次

- [概要](#概要)
- [セットアップ](#セットアップ)
- [開発](#開発)
- [技術スタック](#技術スタック)
- [ドキュメント](#ドキュメント)
- [関連リンク](#関連リンク)
- [ライセンス](#ライセンス)

## 概要

OptiCal は、全てのジャンルのユーザーが違和感なく利用できることを目指したカレンダーアプリケーションです。

## セットアップ

### 前提条件

- Node.js 20 以上
- pnpm 8 以上（推奨パッケージマネージャー）

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/TokujyouKaisennDonnburi/calendar-front.git
cd calendar-front

# 依存関係をインストール
pnpm install
```

### Husky の初期化（初回のみ）

```bash
# Git hooks が自動で設定されます
pnpm install

# または手動で初期化
pnpm exec husky init
```

## 開発

### 開発サーバー起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。ファイルの変更は自動的にリロードされます。

### ビルド

```bash
# 本番ビルド
pnpm run build

# ビルド結果をプレビュー
pnpm start
```

### Storybook

```bash
# 開発モード
pnpm run storybook

# 本番ビルド
pnpm run build-storybook
```

### コード品質チェック

```bash
# フォーマット・リント チェック
pnpm run lint

# 自動フォーマット
pnpm run format
```

### Cloudflare Pages デプロイ検証

```bash
pnpm pages:build
# または
pnpm exec next-on-pages
```

詳細は [DEPLOYMENT.md](./docs/DEPLOYMENT.md) を参照してください。

## 技術スタック

| カテゴリ               | ツール           | バージョン |
| ---------------------- | ---------------- | ---------- |
| **フレームワーク**     | Next.js          | 15.5+      |
| **ランタイム**         | React            | 19+        |
| **言語**               | TypeScript       | 5+         |
| **スタイリング**       | Tailwind CSS     | 4+         |
| **UI コンポーネント**  | Shadcn/ui        | -          |
| **コンポーネント開発** | Storybook        | 8.6+       |
| **コード品質**         | Biome            | 2.2+       |
| **Git フック**         | Husky            | 9+         |
| **ファイル整形**       | Lint-Staged      | 16+        |
| **モック**             | MSW              | 2+         |
| **デプロイ**           | Cloudflare Pages | -          |

## ドキュメント

詳細な情報は以下のドキュメントを参照してください：

- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - 開発ガイドライン、命名規則、Atomic Design パターン、プロジェクト構成
- **[GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md)** - Git ワークフロー、ブランチ命名規則、コミットメッセージ規約
- **[CI_CD.md](./docs/CI_CD.md)** - GitHub Actions、Husky ローカルフック、チェック構成
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Cloudflare Pages デプロイメント、ビルド手順
- **[TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)** - よくあるトラブルと解決方法

## 関連リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Shadcn/ui](https://ui.shadcn.com)
- [Storybook](https://storybook.js.org)
- [Biome](https://biomejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- [next-on-pages](https://github.com/cloudflare/next-on-pages)

## ライセンス

このプロジェクトはプライベートリポジトリです。

## お問い合わせ

質問や提案がある場合は、Issue を作成してください。
