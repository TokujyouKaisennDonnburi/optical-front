import type { Meta, StoryObj } from "@storybook/react";

import { CalendarFullDayEventCard } from "./CalendarFullDayEventCard";

const meta: Meta<typeof CalendarFullDayEventCard> = {
  title: "Molecules/CalendarFullDayEventCard",
  component: CalendarFullDayEventCard,
  parameters: {
    layout: "centered",
  },
  args: {
    title: "終日イベント",
    calendarColor: "#2563eb", // blue-600
  },
};

export default meta;

type Story = StoryObj<typeof CalendarFullDayEventCard>;

/**
 * デフォルト（単日・終日）
 */
export const Default: Story = {};

/**
 * サブタイトルあり
 */
export const WithSubtitle: Story = {
  args: {
    title: "終日イベント",
    subtitle: "社内会議",
    calendarColor: "#16a34a", // green-600
  },
};

/**
 * カラー違い
 */
export const DifferentColor: Story = {
  args: {
    title: "休暇",
    subtitle: "有給休暇",
    calendarColor: "#dc2626", // red-600
  },
};

/**
 * 長いタイトル（省略表示確認）
 */
export const LongTitle: Story = {
  args: {
    title:
      "とても長いタイトルの終日イベントがどのように省略表示されるかを確認するストーリー",
    subtitle: "サブタイトルも長めです",
    calendarColor: "#7c3aed", // violet-600
  },
};

/**
 * サブタイトルなし
 */
export const NoSubtitle: Story = {
  args: {
    title: "終日メンテナンス",
    calendarColor: "#0ea5e9", // sky-500
  },
};
