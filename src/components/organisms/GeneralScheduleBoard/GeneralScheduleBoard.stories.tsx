import type { Meta, StoryObj } from "@storybook/react";

import { GeneralScheduleBoard } from "@/components/organisms/GeneralScheduleBoard";

const meta: Meta<typeof GeneralScheduleBoard> = {
  title: "Organisms/GeneralScheduleBoard",
  component: GeneralScheduleBoard,
  tags: ["autodocs"],
  args: {
    title: "総合",
    items: [
      {
        id: "1",
        title: "プロジェクト定例",
        start: "2024-04-02T09:30:00+09:00",
        memo: "Zoom で実施。アジェンダ共有済み。",
        calendarColor: "#38bdf8",
      },
      {
        id: "2",
        title: "UI レビュー",
        start: "2024-04-05T11:00:00+09:00",
        memo: "デザイン案 v3 を確認。フィードバック整理。",
        calendarColor: "#f97316",
      },
      {
        id: "3",
        title: "営業資料更新",
        start: "2024-04-12T13:30:00+09:00",
        memo: "最新版の KPI を反映する。",
        calendarColor: "#22c55e",
      },
      {
        id: "4",
        title: "1on1 ミーティング",
        start: "2024-04-18T15:00:00+09:00",
        memo: "進捗と課題を共有。",
      },
      {
        id: "5",
        title: "リリース判定会議",
        start: "2024-04-26T17:00:00+09:00",
        memo: "QA 結果をもとに最終判断。",
        calendarColor: "#a855f7",
      },
      {
        id: "6",
        title: "出張",
        start: "2024-03-31T08:00:00+09:00",
        memo: "移動日",
        calendarColor: "#0ea5e9",
      },
      {
        id: "7",
        title: "社外イベント",
        start: "2024-04-30T10:00:00+09:00",
        calendarColor: "#facc15",
      },
    ],
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "総合カレンダー表示用のボード。予定タイトル・開始時刻・メモ・カレンダー色を一覧で表示します。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof GeneralScheduleBoard>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const ErrorState: Story = {
  args: {
    errorMessage: "予定を取得できませんでした",
  },
};
