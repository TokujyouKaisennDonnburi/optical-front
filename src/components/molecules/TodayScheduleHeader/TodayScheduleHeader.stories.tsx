import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/atoms/Button";
import { TodayScheduleHeader } from "@/components/molecules/TodayScheduleHeader";

const meta: Meta<typeof TodayScheduleHeader> = {
  title: "Molecules/TodayScheduleHeader",
  component: TodayScheduleHeader,
  tags: ["autodocs"],
  args: {
    title: "今日の予定",
    dateLabel: "2024年4月12日 (金)",
  },
  parameters: {
    docs: {
      description: {
        component:
          "今日の予定パネルのヘッダー。タイトル、日付ラベル、説明文、アクションボタンの配置を制御します。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TodayScheduleHeader>;

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
