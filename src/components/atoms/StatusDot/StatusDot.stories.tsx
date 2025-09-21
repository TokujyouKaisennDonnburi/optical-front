import type { Meta, StoryObj } from "@storybook/react";
import { StatusDot } from "@/components/atoms/StatusDot";

const meta: Meta<typeof StatusDot> = {
  title: "Atoms/StatusDot",
  component: StatusDot,
  tags: ["autodocs"],
  args: {
    variant: "default",
  },
  parameters: {
    docs: {
      description: {
        component:
          "予定の状態や優先度を示すカラードット。variant で色を切り替え、label でスクリーンリーダー向け説明を付加できます。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof StatusDot>;

export const Default: Story = {};
export const Success: Story = {
  args: { variant: "success" },
};
export const Warning: Story = {
  args: { variant: "warning" },
};
export const Danger: Story = {
  args: { variant: "danger" },
};
export const WithLabel: Story = {
  args: { label: "重要な予定", variant: "info" },
};
