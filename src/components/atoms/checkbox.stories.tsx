import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@/components/atoms/Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Radix Checkbox のラッパー。checked/disabled をサポート。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = { args: { defaultChecked: false } };
export const Checked: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
