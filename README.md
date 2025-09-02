# Calendar Front

Next.js プロジェクトのフロントエンドリポジトリです

## セットアップ

開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください

`app/page.tsx` を編集するとページが自動更新されます

## UI コンポーネント

このプロジェクトでは [shadcn/ui](https://ui.shadcn.com) を使用しています

### インストール

shadcn を初期化：

```bash
npx shadcn@latest init
```

コンポーネント追加（例：button）：

```bash
npx shadcn@latest add button
```

### 注意事項

- 古い `shadcn-ui` CLI は非推奨です。代わりに `shadcn` を使ってください
- コマンド実行前に Tailwind CSS が設定されていることを確認してください

## 命名規則

### ✅ ファイル名・コンポーネント名

- ファイル名は **アッパーパスカルケース**（PascalCase）
- コンポーネント名も **アッパーパスカルケース**

### ✅ Props 名・変数名・関数名

| 種別         | 規則           | 例                                |
| ------------ | -------------- | --------------------------------- |
| Props 型名   | パスカルケース | `HeroCardProps`, `LoginFormProps` |
| 関数・変数名 | キャメルケース | `handleClick`, `isLoggedIn`       |

### ✅ ディレクトリ構成（Atomic Design）

| 種別           | 規則                   | 例                                                      |
| -------------- | ---------------------- | ------------------------------------------------------- |
| ディレクトリ名 | 小文字 or ケバブケース | `atoms`, `molecules`, `organisms`, `templates`, `pages` |

## Git ブランチ命名規則

このプロジェクトでは以下の prefix を使用します：

- `feat/` : 新機能追加
- `fix/` : バグ修正
- `hotfix/` : 本番環境での緊急修正
- `chore/` : ビルドや依存関係などの雑務
- `docs/` : ドキュメント修正
- `style/` : フォーマット調整（動作変更なし）
- `refactor/` : リファクタリング
- `test/` : テスト関連
- `perf/` : パフォーマンス改善
