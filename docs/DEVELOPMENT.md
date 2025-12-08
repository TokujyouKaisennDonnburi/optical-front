# 開発ガイドライン

このドキュメントは開発時の命名規則、Atomic Design パターン、プロジェクト構成についての指針を記載しています。

## 命名規則

### ファイル名・コンポーネント名

- **パスカルケース** を使用します
- 例：`Button.tsx`, `UserCard.tsx`, `AccountMenu.tsx`

### Props 型名

```typescript
// ✅ 良い例
type ButtonProps = {
  label: string;
  onClick: () => void;
};

interface CardProps {
  title: string;
}
```

### 関数・変数名

- **キャメルケース** を使用します
- 例：`handleClick()`, `isLoggedIn`, `formatDate()`

### ディレクトリ名

- **小文字またはケバブケース** を使用します
- 例：`atoms`, `molecules`, `organisms`, `today-schedule`

## Atomic Design の構成

| レベル        | 説明                   | 例                                 |
| ------------- | ---------------------- | ---------------------------------- |
| **Atoms**     | 最小単位の UI 要素     | Button, Badge, Input, Text         |
| **Molecules** | Atoms の組み合わせ     | SearchInput, SelectCalendarCard    |
| **Organisms** | Molecules の組み合わせ | CalendarGrid, GeneralScheduleBoard |
| **Templates** | ページレイアウト       | -                                  |
| **Pages**     | App Router の page.tsx | app/page.tsx                       |

## プロジェクト構成

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # トップページ
│   ├── api/                     # API ルート
│   ├── calendars/               # カレンダー機能
│   └── landing/                 # ランディングページ
├── components/                   # React コンポーネント（Atomic Design）
│   ├── atoms/                   # 基本要素
│   ├── molecules/               # 小さなグループ
│   ├── organisms/               # 大きなグループ
│   ├── templates/               # レイアウトテンプレート
│   ├── ui/                      # Shadcn/ui ラッパー
│   └── providers/               # React Context/Providers
├── hooks/                        # React カスタムフック
├── mocks/                        # MSW モック定義
├── lib/                          # 実用的なライブラリ関数
├── types/                        # TypeScript 型定義
├── utils_constants_styles/       # ユーティリティ関数・定数
└── app/
    ├── globals.css             # グローバルスタイル
    └── page.tsx                # ページコンポーネント
```

## ベストプラクティス

### コンポーネント設計

1. **単一責任の原則** - 1つのコンポーネントは1つの役割を持つ
2. **再利用性** - 汎用性の高い設計を心がける
3. **テストしやすさ** - 外部依存を最小化し、ロジックを分離する

### TypeScript の使用

- すべてのファイルに型定義を記載
- `any` 型は使用しない
- `// @ts-ignore` コメントは最小限に

### パフォーマンス

- 不要な re-render を避ける（`React.memo`, `useMemo`）
- 大きなリストは仮想化を検討
- 動的インポートで Code Splitting を活用

### アクセシビリティ

- Semantic HTML を使用
- `aria-*` 属性を適切に設定
- キーボード操作をサポート
