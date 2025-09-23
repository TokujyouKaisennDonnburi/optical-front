import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/atoms/Input";

const meta: Meta<typeof Input> = {
  title: "Atoms/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Type here...",
  },
  parameters: {
    docs: {
      description: {
        component:
          "shadcn ベースのテキスト入力。type のデフォルトは 'text'。disabled や placeholder 等に対応。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Password: Story = {
  args: { type: "password", placeholder: "••••••" },
};
