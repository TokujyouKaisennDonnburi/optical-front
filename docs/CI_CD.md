# CI/CD パイプライン

このドキュメントは GitHub Actions と Husky によるローカル Git フックについて記載しています。

## GitHub Actions ワークフロー

すべての PR で以下の自動チェックが実行されます。

### pr-checks.yml

**トリガー:** PR 作成時（`main`, `develop`, `feat/**` ブランチ対象）

**実行ジョブ（並列実行）:**

#### 1. Biome Lint & Format

```bash
pnpm run lint
```

- コードスタイルの統一性をチェック
- リント違反を検出
- import の並び順などを確認

#### 2. TypeScript Type Check

```bash
pnpm typecheck
```

- 型エラーを検出
- 型安全性を確保

#### 3. Next.js Build

```bash
pnpm run build
```

- ビルドエラーを事前検出
- 本番環境で動作することを確認

### bundle-size.yml

**トリガー:** PR 作成時

**実行内容:**

```bash
ANALYZE=true pnpm run build
```

- バンドルサイズを分析
- 分析レポートを Artifact に保存（30 日間）
- ビルド警告を検出

### discord-notify.yml

**トリガー:** Issue/PR イベント

**機能:**

- Issue アサイン時に通知
- PR レビュー依頼時に通知
- PR マージ時に通知
- PR レビュー到着時に通知

## ローカル Git フック（Husky）

コミット前と push 前にローカルで自動チェックが実行されます。

### pre-commit フック

**実行タイミング:** `git commit` 時

```bash
pnpm lint-staged --config package.json
```

**実行内容:**

ステージングされたファイルに対して軽量なチェックを実行：

- `biome lint --fix` - リント違反を自動修正
- `biome format --write` - コードをフォーマット＆import ソート

**失敗時:** コミットが中止される

### pre-push フック

**実行タイミング:** `git push` 時

```bash
pnpm lint
pnpm typecheck
pnpm exec next-on-pages
```

**実行内容:**

以下を順に実行し、いずれか一つでも失敗したら push を中断：

1. **pnpm lint** - 全体の Biome による静的チェック
2. **pnpm typecheck** - TypeScript 型チェック
3. **pnpm exec next-on-pages** - Cloudflare Pages と同等の本番ビルド検証

**失敗時:** push が中止される

### commit-msg フック

**実行タイミング:** `git commit` 時（メッセージ入力後）

```bash
pnpm exec commitlint --edit "$1"
```

**実行内容:**

- コミットメッセージが Conventional Commits に従っているか検証

**失敗時:** コミットが中止される

## チェック構成図

```
ローカル開発
   ↓
git add .
   ↓
git commit (Husky pre-commit が自動実行)
   ├─ lint-staged (ステージングファイルのみ)
   │  ├─ biome lint --fix
   │  └─ biome format --write
   └─ commit-msg (コミットメッセージ検証)
   ↓
コミット成功
   ↓
git push (Husky pre-push が自動実行)
   ├─ pnpm lint (全体チェック)
   ├─ pnpm typecheck (型チェック)
   └─ pnpm exec next-on-pages (Cloudflare Pages ビルド検証)
   ↓
Push 成功
   ↓
PR 作成
   ↓
GitHub Actions (並列実行)
   ├─ Biome Lint
   ├─ TypeScript Type Check
   ├─ Next.js Build
   └─ Bundle Size Analysis
   ↓
すべて成功 → マージ可能
```

## Husky フック ファイル

### .husky/pre-commit

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running pre-commit checks..."

if command -v pnpm >/dev/null 2>&1; then
  pnpm lint-staged --config package.json || exit 1
else
  npx lint-staged --config package.json || exit 1
fi

echo "pre-commit checks passed!"
```

### .husky/pre-push

```bash
echo "Running pre-push checks..."

pnpm lint || exit 1
pnpm typecheck || exit 1
pnpm exec next-on-pages || exit 1

echo "pre-push checks passed!"
```

## トラブルシューティング

### フックが実行されない

```bash
# 権限を確認
ls -la .husky/pre-commit .husky/pre-push

# 権限がない場合
chmod +x .husky/pre-commit .husky/pre-push

# 再度インストール
pnpm install
```

### フックを一時的にスキップ

```bash
# --no-verify フラグで実行
git commit --no-verify
git push --no-verify
```

**注意:** 本番環境に問題なコードをマージしないよう、慎重に使用してください。

## フック設定ファイル

lint-staged の設定は `package.json` に記載：

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["biome lint --fix", "biome format --write"],
    "*.json": ["biome format --write"]
  }
}
```

commitlint の設定は `commitlint.config.js` を参照。

## 参考資料

- [Husky](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [commitlint](https://commitlint.js.org/)
