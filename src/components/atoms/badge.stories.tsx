import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/atoms/Badge";

const meta: Meta<typeof Badge> = {
  title: "Atoms/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Badge" },
  parameters: {
    docs: {
      description: {
        component: "ステータスやラベル表示用のバッジ。variant により色を切替。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { variant: "destructive" } };
export const Outline: Story = { args: { variant: "outline" } };
