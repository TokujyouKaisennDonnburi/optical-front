import type { Meta, StoryObj } from "@storybook/react";

import { TodayScheduleTimeline } from "@/components/molecules/TodayScheduleTimeline";

const meta: Meta<typeof TodayScheduleTimeline> = {
  title: "Molecules/TodayScheduleTimeline",
  component: TodayScheduleTimeline,
  tags: ["autodocs"],
  args: {
    slots: [
      {
        time: "08:00",
        events: [
          {
            id: "1",
            title: "朝会",
            memo: "オンラインで進行状況を共有",
            statusVariant: "info",
            calendarColor: "#22d3ee",
            timeRange: { start: "08:00", end: "08:30" },
          },
        ],
      },
      { time: "09:00" },
      {
        time: "10:00",
        events: [
          {
            id: "2",
            title: "顧客ミーティング",
            memo: "資料の最終確認",
            location: "第1会議室",
            statusVariant: "success",
            timeRange: { start: "10:00", end: "11:00" },
          },
        ],
      },
      { time: "11:00" },
    ],
  },
  parameters: {
    docs: {
      description: {
        component:
          "今日の予定パネル右側に表示する時間タイムライン。各スロット内の予定をホバーするとメモや詳細が確認できます。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TodayScheduleTimeline>;

export const Default: Story = {};
export const WithCurrentTime: Story = {
  args: {
    slots: [
      { time: "07:00" },
      {
        time: "08:00",
        isCurrent: true,
        events: [
          {
            id: "current",
            title: "コードレビュー",
            memo: "PR-234 の確認",
            statusVariant: "warning",
            timeRange: { start: "08:00", end: "08:45" },
          },
        ],
      },
      { time: "09:00" },
    ],
  },
};
