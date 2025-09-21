import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/atoms/Button";
import { TodaySchedulePanel } from "@/components/organisms/TodaySchedulePanel";

const meta: Meta<typeof TodaySchedulePanel> = {
  title: "Organisms/TodaySchedulePanel",
  component: TodaySchedulePanel,
  tags: ["autodocs"],
  args: {
    header: {
      title: "今日の予定",
      dateLabel: "2024年4月12日 (金)",
    },
    items: [
      {
        id: "1",
        title: "朝会",
        timeRange: { start: "09:00", end: "09:30" },
        statusVariant: "info",
        memo: "オンラインで進行状況を共有します。",
        calendarColor: "#22d3ee",
      },
      {
        id: "2",
        title: "顧客ミーティング",
        timeRange: { start: "11:00", end: "12:00" },
        statusVariant: "success",
        location: "第1会議室",
        memo: "新機能の提案内容をレビューします。",
        calendarColor: "#34d399",
      },
      {
        id: "3",
        title: "デザインレビュー",
        timeRange: { start: "15:30", end: "16:30" },
        statusVariant: "warning",
        memo: "UI の最終調整ポイントを洗い出します。",
        calendarColor: "#f59e0b",
      },
    ],
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "今日の予定パネル全体。ヘッダー、予定リスト、時間タイムラインで構成され、ホバーで予定タイトルとメモを参照できます。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TodaySchedulePanel>;

export const Default: Story = {};
export const WithActions: Story = {
  args: {
    header: {
      title: "今日の予定",
      dateLabel: "2024年4月12日 (金)",
      actions: (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            表示設定
          </Button>
          <Button size="sm">予定を追加</Button>
        </div>
      ),
    },
  },
};
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};
export const Empty: Story = {
  args: {
    items: [],
    emptyMessage: "今日は予定がありません",
  },
};
