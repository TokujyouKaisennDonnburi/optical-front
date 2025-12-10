import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/atoms/Label";

const meta: Meta<typeof Label> = {
  title: "Atoms/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: {
    children: "Label Text",
  },
};

export const WithCustomClass: Story = {
  args: {
    children: "Custom Styled Label",
    className: "text-red-500",
  },
};

export const WithHtmlFor: Story = {
  render: () => (
    <div>
      <Label htmlFor="input-id">Label for Input</Label>
      <input id="input-id" type="text" />
    </div>
  ),
};
