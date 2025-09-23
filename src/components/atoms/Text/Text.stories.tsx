import type { Meta, StoryObj } from "@storybook/react";
import { Text } from "@/components/atoms/Text";

const meta: Meta<typeof Text> = {
  title: "Atoms/Text",
  component: Text,
  tags: ["autodocs"],
  args: {
    children: "Sample text",
  },
  parameters: {
    docs: {
      description: {
        component:
          "軽量なテキスト表示コンポーネント。size/weight と as (タグ) を指定可能。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const MediumWeight: Story = { args: { weight: "medium" } };
export const SemiBold: Story = { args: { weight: "semibold" } };
export const Bold: Story = { args: { weight: "bold" } };
