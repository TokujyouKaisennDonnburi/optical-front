# Git ワークフロー

このドキュメントは Git ワークフロー、ブランチ命名規則、コミットメッセージ規約について記載しています。

## ブランチ命名規則

```
<type>/<issue-number>: <description>
```

### Type の種類

| Type       | 説明                         | 例                                     |
| ---------- | ---------------------------- | -------------------------------------- |
| `feat`     | 新機能追加                   | `feat/issue13: カレンダー作成ページ`   |
| `fix`      | バグ修正                     | `fix/issue10: スケジュール重なり修正`  |
| `hotfix`   | 本番緊急修正                 | `hotfix/issue99: クリティカルバグ修正` |
| `chore`    | 雑務（ビルド、依存関係など） | `chore: npm パッケージ更新`            |
| `docs`     | ドキュメント修正             | `docs: README 更新`                    |
| `style`    | フォーマット（動作変更なし） | `style/issue14: スクロールバー最適化`  |
| `refactor` | リファクタリング             | `refactor: コンポーネント分割`         |
| `test`     | テスト関連                   | `test: ユニットテスト追加`             |
| `perf`     | パフォーマンス改善           | `perf: バンドルサイズ削減`             |
| `ci`       | CI/CD 改善                   | `ci/issue18: GitHub Actions 設定`      |

## コミットメッセージ

### 形式

```
<type>/<issue-number>: <description>

[optional body]
```

### 規則

- Conventional Commits に従う
- 命令形で記述（`implement` ではなく `implement` のような形）
- 過去形ではなく現在形を使用
- 簡潔に（タイトルは 50 文字以内が目安）

### ✅ 良い例

```
feat/issue123: ユーザー認証機能を実装する

- Google OAuth 認証を追加
- セッション管理を実装
- ログアウト機能を追加
```

```
fix/issue10: スケジュール重なり表示の修正
```

```
docs: README に Cloudflare Pages の記載を追加
```

### ❌ 悪い例

```
fix stuff
```

```
update files
```

```
WIP
```

## ブランチルール（現在は無視、将来的に適応）

### 予定されているブランチ運用

1. **main** ブランチ
   - 本番リリース版
   - 直接コミット禁止
   - PR レビュー必須
   - `develop` からのみマージ可能

2. **develop** ブランチ
   - 開発版
   - 全機能は `develop` ベース
   - PR レビュー必須
   - フィーチャーブランチからマージ

3. **フィーチャーブランチ** (`feat/`, `fix/`, `hotfix/` など)
   - `develop` から作成
   - 作業終了後に `develop` への PR を作成
   - コードレビュー後にマージ

## ワークフロー例

```bash
# 最新の develop を取得
git checkout develop
git pull origin develop

# フィーチャーブランチを作成
git checkout -b feat/issue123-user-auth

# 開発・コミット
git add .
git commit -m "feat/issue123: ユーザー認証機能を実装"

# push して PR を作成
git push origin feat/issue123-user-auth

# GitHub で PR を作成し、レビューを待つ
# レビュー後にマージ
```

## クリーンアップ

PR がマージされた後、ローカルブランチを削除：

```bash
# ローカルブランチを削除
git branch -d feat/issue123-user-auth

# リモートブランチを削除
git push origin --delete feat/issue123-user-auth
```

## 参考資料

- [Conventional Commits](https://www.conventionalcommits.org/ja/)
- [Git Flow チートシート](https://danielkummer.github.io/git-flow-cheatsheet/index.ja_JP.html)
