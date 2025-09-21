import type { Meta, StoryObj } from "@storybook/react";
import { TimeLabel } from "@/components/atoms/TimeLabel";

const meta: Meta<typeof TimeLabel> = {
  title: "Atoms/TimeLabel",
  component: TimeLabel,
  tags: ["autodocs"],
  args: {
    time: "09:00",
  },
  parameters: {
    docs: {
      description: {
        component:
          "タイムライン用のラベル。時間表示と補助テキスト、現在時刻の強調に対応します。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof TimeLabel>;

export const Default: Story = {};
export const WithSuffix: Story = {
  args: {
    time: "09",
    suffix: "AM",
  },
};
export const WithDescription: Story = {
  args: {
    description: "定例ミーティング",
  },
};
export const Current: Story = {
  args: {
    isCurrent: true,
  },
};
