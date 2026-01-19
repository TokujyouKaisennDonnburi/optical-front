import type { Meta, StoryObj } from "@storybook/react";
import { PullRequestReviewOption } from "./index";

const meta: Meta<typeof PullRequestReviewOption> = {
  title: "Organisms/PullRequestReviewOption",
  component: PullRequestReviewOption,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: `
## PR レビュー待ち通知ウィジェット

calendarId を受け取り、GitHub API からレビュー待ち PR を取得して
ベルアイコン + バッジ + リストで表示するオプションコンポーネント。

### 使い方

\`\`\`tsx
import { PullRequestReviewOption } from "@/components/organisms/EngineerOption/PullRequestReviewOption";

<PullRequestReviewOption
  calendarId="calendar-123"
  allPrsUrl="https://github.com/owner/repo/pulls"
/>
\`\`\`

### Storybook でのテスト

コンポーネントは内部で API を呼び出すため、
Storybook でテストする場合は MSW でモックが必要です。
        `,
      },
    },
  },
  argTypes: {
    calendarId: {
      description: "カレンダー ID",
      control: "text",
    },
    allPrsUrl: {
      description: "GitHub リポジトリの PR 一覧へのリンク",
      control: "text",
    },
  },
};
export default meta;

type Story = StoryObj<typeof PullRequestReviewOption>;

/** デフォルト: 複数の PR がある状態 */
export const Default: Story = {
  args: {
    calendarId: "example-calendar-id",
    allPrsUrl: "https://github.com/example/repo/pulls",
  },
};

/** 緊急タグ付きの PR を含む */
export const WithUrgent: Story = {
  args: {
    calendarId: "example-calendar-id-urgent",
    allPrsUrl: "https://github.com/example/repo/pulls",
  },
};

/** 空状態: レビュー待ちがない */
export const Empty: Story = {
  args: {
    calendarId: "example-calendar-id-empty",
    allPrsUrl: "https://github.com/example/repo/pulls",
  },
};

/** フッターリンクなし */
export const WithoutFooterLink: Story = {
  args: {
    calendarId: "example-calendar-id-no-footer",
  },
};

/** 3件以上: スクロール表示 */
export const WithScroll: Story = {
  args: {
    calendarId: "example-calendar-id-scroll",
    allPrsUrl: "https://github.com/example/repo/pulls",
  },
};
