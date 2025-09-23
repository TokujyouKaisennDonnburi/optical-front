import type { Meta, StoryObj } from "@storybook/react";

import { ScheduleEventCard } from "@/components/molecules/ScheduleEventCard";

const meta = {
  title: "Molecules/ScheduleEventCard",
  component: ScheduleEventCard,
  args: {
    title: "プロジェクト定例",
    subtitle: "10:00 - 11:00",
    calendarColor: "#38bdf8",
  },
} satisfies Meta<typeof ScheduleEventCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Timeline: Story = {
  args: {
    variant: "timeline",
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
  },
};
