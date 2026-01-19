import type { Meta, StoryObj } from "@storybook/react";
import { TeamReviewLoadOption } from "./TeamReviewLoadOption";

const meta: Meta<typeof TeamReviewLoadOption> = {
  title: "Organisms/TeamReviewLoadOption",
  component: TeamReviewLoadOption,
  parameters: {
    docs: {
      description: {
        component:
          "calendarId を受け取り、GitHub API からチームメンバーのレビュー負荷情報を取得して表示するオプション UI。コンポーネントは内部で API を呼び出し、レビュアー変更イベントをコールバックで通知します。",
        story: "Storybook でテストする場合は MSW でモックが必要です。",
      },
    },
  },
  args: {
    calendarId: "example-calendar-id",
    onReviewerChange: (payload) =>
      console.log("reviewer-change", JSON.stringify(payload, null, 2)),
  },
  argTypes: {
    calendarId: {
      control: { type: "text" },
      description: "カレンダー ID",
    },
    onReviewerChange: {
      action: "reviewer-change",
      description:
        "レビュアー変更トリガーを受け取るコールバック。ChangeReviewerRequest 型のペイロードが渡されます。",
    },
  },
};

export default meta;

type Story = StoryObj<typeof TeamReviewLoadOption>;

export const Primary: Story = {
  args: {
    calendarId: "example-calendar-id",
  },
};

export const LinkOnlyFallback: Story = {
  args: {
    calendarId: "example-calendar-id-link-only",
    onReviewerChange: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "レビュアー変更コールバックを渡さない場合、各 PR には GitHub への遷移ボタンのみが表示されます。",
      },
    },
  },
};

export const EmptyState: Story = {
  args: {
    calendarId: "example-calendar-id-empty",
  },
  parameters: {
    docs: {
      description: {
        story: "メンバーがいない状態を確認するためのストーリー。",
      },
    },
  },
};
