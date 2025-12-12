import type { Meta, StoryObj } from "@storybook/react";
import { AllDayEventCard } from "./AllDayEventCard";

const meta: Meta<typeof AllDayEventCard> = {
  title: "Molecules/AllDayEventCard",
  component: AllDayEventCard,
  args: {
    title: "終日イベント",
    subtitle: "サンプル説明文",
    calendarColor: "#0ea5e9",
  },
};
export default meta;

type Story = StoryObj<typeof AllDayEventCard>;

/* ----------------------------
   Compact Variant
----------------------------- */
export const Compact: Story = {
  args: {
    variant: "compact",
  },
};

/* ----------------------------
   Timeline Variant
----------------------------- */
export const Timeline: Story = {
  args: {
    variant: "timeline",
    title: "10:00 - 11:00 会議",
    subtitle: "Zoomミーティング",
  },
};

/* ----------------------------
   Span: 単日（開始＝終了）
----------------------------- */
export const SpanSingle: Story = {
  args: {
    variant: "span",
    isStart: true,
    isEnd: true,
    title: "1日だけの終日イベント",
  },
};

/* ----------------------------
   Span: 開始のみ
----------------------------- */
export const SpanStart: Story = {
  args: {
    variant: "span",
    isStart: true,
    isEnd: false,
    title: "連続イベント（開始）",
  },
};

/* ----------------------------
   Span: 中間
----------------------------- */
export const SpanMiddle: Story = {
  args: {
    variant: "span",
    isStart: false,
    isMiddle: true,
    isEnd: false,
    title: "連続イベント（中間）",
  },
};

/* ----------------------------
   Span: 終了のみ
----------------------------- */
export const SpanEnd: Story = {
  args: {
    variant: "span",
    isStart: false,
    isEnd: true,
    title: "連続イベント（終了）",
  },
};

/* ----------------------------
   色違い
----------------------------- */
export const CustomColor: Story = {
  args: {
    variant: "compact",
    calendarColor: "#10b981",
    title: "カスタムカラーイベント",
    subtitle: "緑色の終日イベント",
  },
};
