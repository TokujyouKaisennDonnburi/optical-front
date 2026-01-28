import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/atoms/Button";
import { DailyHeader } from "@/components/molecules/DailyHeader";

const meta: Meta<typeof DailyHeader> = {
  title: "Molecules/DailyHeader",
  component: DailyHeader,
  tags: ["autodocs"],
  args: {
    title: "直近の予定",
    dateLabel: "2024年4月12日 (金)",
  },
  parameters: {
    docs: {
      description: {
        component:
          "直近の予定パネルのヘッダー。タイトル、日付ラベル、説明文、アクションボタンの配置を制御します。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DailyHeader>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    actions: (
      <>
        <Button size="sm" variant="ghost">
          表示設定
        </Button>
        <Button size="sm">予定を追加</Button>
      </>
    ),
  },
};
export const WithDescription: Story = {
  args: {
    description: "チーム参加者全員のスケジュールを表示しています。",
  },
};
