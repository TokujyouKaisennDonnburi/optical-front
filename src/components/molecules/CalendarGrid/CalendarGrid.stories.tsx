import type { Meta, StoryObj } from "@storybook/react";

import { CalendarGrid } from "@/components/molecules/CalendarGrid";

const CALENDAR_PLACEHOLDER_KEYS = Array.from(
  { length: 42 },
  (_, index) => `calendar-cell-${index + 1}`,
);

const meta = {
  title: "Molecules/CalendarGrid",
  component: CalendarGrid,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    children: (
      <div className="grid flex-1 grid-cols-7 grid-rows-6">
        {CALENDAR_PLACEHOLDER_KEYS.map((cellKey, index) => (
          <div
            key={cellKey}
            className="flex items-center justify-center border border-white/10 text-xs text-white/70"
          >
            {index + 1}
          </div>
        ))}
      </div>
    ),
  },
} satisfies Meta<typeof CalendarGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
