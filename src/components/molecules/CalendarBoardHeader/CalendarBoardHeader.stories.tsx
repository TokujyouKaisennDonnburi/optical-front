import type { Meta, StoryObj } from "@storybook/react";

import { CalendarBoardHeader } from "@/components/molecules/CalendarBoardHeader";

const meta = {
  title: "Molecules/CalendarBoardHeader",
  component: CalendarBoardHeader,
  args: {
    badgeLabel: "総合",
    monthLabel: "2024年4月",
  },
  parameters: {
    docs: {
      description: {
        component:
          "カレンダーボードのバッジと月切り替えコントロールをまとめたヘッダーコンポーネントです。",
      },
    },
  },
} satisfies Meta<typeof CalendarBoardHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onPrev: () => undefined,
    onNext: () => undefined,
    onToday: () => undefined,
  },
};
