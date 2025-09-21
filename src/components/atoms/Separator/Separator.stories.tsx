import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "@/components/atoms/Separator";

const meta: Meta<typeof Separator> = {
  title: "Atoms/Separator",
  component: Separator,
  tags: ["autodocs"],
  args: {
    orientation: "horizontal",
    className: "w-48",
  },
  parameters: {
    docs: {
      description: {
        component:
          "shadcn ベースのセパレーター。orientation に応じて水平・垂直の線を描画します。",
      },
    },
  },
  render: (args) => (
    <div className="flex h-16 items-center justify-center">
      <Separator {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {};
export const Vertical: Story = {
  args: {
    orientation: "vertical",
    className: "h-12",
  },
};
