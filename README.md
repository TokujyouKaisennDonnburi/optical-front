これは[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)でブートストラップされた[Next.js](https://nextjs.org)プロジェクトです。

## shadcn による UI コンポーネント

このプロジェクトでは UI コンポーネントに[shadcn/ui](https://ui.shadcn.com)を使用しています。

### インストール

shadcn を初期化します：

```bash
npx shadcn@latest init
```

コンポーネントを追加します（例：button）：

```bash
npx shadcn@latest add button
```

### 注意事項

- 古い`shadcn-ui` CLI は非推奨です。代わりに`shadcn`を使用してください。
- コマンドを実行する前に Tailwind CSS が正しく設定されていることを確認してください。

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

## はじめに

まず、開発サーバーを起動します：

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで[http://localhost:3000](http://localhost:3000)を開いて結果を確認してください。

`app/page.tsx`を編集することでページを変更できます。ファイルを編集するとページが自動的に更新されます。

このプロジェクトは[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)を使用して、Vercel の新しいフォントファミリーである[Geist](https://vercel.com/font)を自動的に最適化し読み込みます。

## さらに学ぶ

Next.js についてもっと知りたい場合は、以下のリソースをご覧ください：

- [Next.js ドキュメント](https://nextjs.org/docs) - Next.js の機能や API について学べます。
- [Next.js チュートリアル](https://nextjs.org/learn) - インタラクティブな Next.js のチュートリアルです。

[Next.js の GitHub リポジトリ](https://github.com/vercel/next.js)もチェックしてみてください。フィードバックや貢献を歓迎します！

## Vercel でのデプロイ

Next.js アプリをデプロイする最も簡単な方法は、Next.js の開発元である[Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)を使用することです。

詳細は[Next.js のデプロイメントドキュメント](https://nextjs.org/docs/app/building-your-application/deploying)をご覧ください。
