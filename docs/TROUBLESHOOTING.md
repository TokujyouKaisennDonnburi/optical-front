# トラブルシューティング

このドキュメントは開発中に発生しやすい問題と解決方法をまとめています。

## セットアップ・インストール

### pnpm が見つからない

**エラー:**

```
-bash: pnpm: command not found
```

**解決:**

```bash
# pnpm をグローバルインストール
npm install -g pnpm

# または Homebrew (macOS)
brew install pnpm

# バージョン確認
pnpm --version
```

### 依存関係のインストール失敗

**エラー:**

```
ERR! ERR_PNPM_...
```

**解決:**

```bash
# キャッシュをクリア
pnpm store prune

# node_modules と lock ファイルを削除
rm -rf node_modules pnpm-lock.yaml

# 再インストール
pnpm install
```

### Node.js バージョンが古い

**エラー:**

```
Node version v14.x.x is not supported
```

**解決:**

```bash
# Node.js 20+ をインストール
node --version  # 確認
nvm install 20  # または nodenv, asdf など

# または Homebrew (macOS)
brew install node@20
```

## 開発中の問題

### ホットリロードが効かない

**原因:** ファイルウォッチャーのリソース不足

**解決:**

```bash
# 開発サーバーを再起動
pnpm dev

# またはシステムのファイルディスクリプタ上限を増やす (macOS)
ulimit -n 10240
```

### コンポーネントが反映されない

**原因:** キャッシュの問題

**解決:**

```bash
# .next フォルダを削除
rm -rf .next

# 開発サーバーを再起動
pnpm dev
```

### Storybook がビルドできない

**エラー:**

```
Compilation failed
```

**解決:**

```bash
# 依存関係を再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install

# キャッシュをクリア
pnpm run build-storybook --reset-config

# ビルド再試行
pnpm run build-storybook
```

## リント・型チェック

### Biome lint エラーが修正されない

**原因:** `--fix` フラグが無視されている

**解決:**

```bash
# 強制的に修正
pnpm lint --fix

# または manual で修正
pnpm exec biome format --write src/
```

### TypeScript 型エラーが多発

**エラー:**

```
Type 'X' is not assignable to type 'Y'
```

**解決:**

```bash
# TypeScript キャッシュをクリア
pnpm exec tsc --listFilesOnly

# または削除して再実行
rm -rf .tsc-cache
pnpm typecheck
```

### import 順序が正しくない

**原因:** Biome の import organize ルール

**解決:**

```bash
# 自動修正を実行
pnpm lint --fix

# または手動で biome format
pnpm exec biome format --write src/
```

## Git・Husky フック

### Husky フックが実行されない

**原因:** フックファイルに実行権限がない

**解決:**

```bash
# 権限を確認
ls -la .husky/

# 権限がない場合
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

# Husky を再初期化
pnpm exec husky init
```

### pre-commit でエラーが出て commit できない

**例:**

```
✖ 1 error
  ...format or lint error...
```

**解決:**

```bash
# エラーを確認して手動で修正
pnpm lint --fix
pnpm exec biome format --write src/

# または commit スキップ（非推奨）
git commit --no-verify
```

### pre-push で lint エラーが出て push できない

**解決:**

```bash
# エラーを確認
pnpm lint

# 修正を実行
pnpm lint --fix

# または個別に実行
pnpm typecheck
pnpm exec next-on-pages

# push 再試行
git push origin HEAD
```

### コミットメッセージエラー

**エラー:**

```
✖ commit-msg validation failed
```

**原因:** Conventional Commits 形式に従っていない

**解決:**

コミットメッセージを修正：

```bash
# 例（正しい形式）
git commit -m "feat/issue123: 新機能を実装した"
git commit -m "fix/issue10: バグを修正した"
```

詳しくは [GIT_WORKFLOW.md](./GIT_WORKFLOW.md#コミットメッセージ) を参照。

## ビルド・デプロイ

### 本番ビルドに失敗

**エラー:**

```
ESLint found errors
```

**解決:**

```bash
# ローカルで同じ条件でビルド
pnpm run build

# エラーを修正
pnpm lint --fix

# 再度ビルド
pnpm run build
```

### Cloudflare Pages ビルドが失敗

**エラー:**

```
next-on-pages: Build failed
```

**解決:**

```bash
# ローカルで pages:build を実行
pnpm pages:build

# ビルド出力を確認
pnpm exec next-on-pages --debug

# 詳細は DEPLOYMENT.md を参照
```

### Edge Runtime が非互換

**例:**

```
fs is not available in Edge Runtime
```

**解決:** [DEPLOYMENT.md - Edge Runtime との互換性](./DEPLOYMENT.md#edge-runtimeとの互換性) を参照。

### バンドルサイズが大きすぎる

**解決:**

```bash
# バンドルサイズを分析
ANALYZE=true pnpm run build

# 不要な依存関係を確認・削除
pnpm list | grep unused

# Code Splitting を活用
import dynamic from "next/dynamic";
const Component = dynamic(() => import("./Component"));
```

## パフォーマンス

### ビルドが遅い

**原因:** 大量の依存関係や大きなバンドルサイズ

**解決:**

```bash
# ビルド時間を測定
time pnpm run build

# 依存関係を確認
pnpm ls

# 不要なパッケージを削除
pnpm remove package-name
```

### 開発サーバーが遅い

**原因:** ファイルウォッチャーの過負荷

**解決:**

```bash
# 開発サーバーを再起動
pnpm dev

# またはポート番号を指定
pnpm dev -- -p 3001
```

## 環境変数

### 環境変数が読み込まれない

**原因:** `NEXT_PUBLIC_` プレフィックスの有無

**解決:**

```bash
# クライアント側で使用する場合
NEXT_PUBLIC_API_URL=https://api.example.com

# サーバー側でのみ使用
API_SECRET_KEY=secret_value

# .env.local ファイルに記載
# git で管理しない（.gitignore に追加）
```

### Cloudflare Pages で環境変数が機能しない

**原因:** 環境変数が設定されていない、または読み込みタイミング

**解決:**

```bash
# Cloudflare ダッシュボードで設定
Pages → Project → Settings → Environment variables

# ローカルテスト
NEXT_PUBLIC_VAR=value pnpm pages:build
```

## その他

### ポート 3000 が既に使用されている

**解決:**

```bash
# 別のポートを使用
pnpm dev -- -p 3001

# または既存プロセスを終了 (macOS)
lsof -ti:3000 | xargs kill -9
```

### キャッシュに関する奇妙な動作

**解決:**

```bash
# ブラウザキャッシュをクリア
# デベロッパーツール → Application → Clear site data

# または開発サーバー起動時にキャッシュを無効化
CACHE_DISABLE=1 pnpm dev
```

### 誤ってコミットしてしまった

**解決:**

```bash
# 直前のコミットを修正
git commit --amend

# または前のコミットをリセット
git reset --soft HEAD~1

# コミット履歴から削除（注意！）
git revert COMMIT_HASH
```

## サポート

上記の方法で解決できない場合は、以下を確認してください：

- GitHub Issues で同様の問題が報告されていないか
- プロジェクトのドキュメント
- 各ツールの公式ドキュメント
- チームメンバーに相談

## よくあるコマンド

```bash
# 完全なリセット
rm -rf node_modules pnpm-lock.yaml .next
pnpm install
pnpm dev

# 全チェックを実行
pnpm lint
pnpm typecheck
pnpm pages:build

# キャッシュの完全削除
pnpm store prune
rm -rf .next
```
