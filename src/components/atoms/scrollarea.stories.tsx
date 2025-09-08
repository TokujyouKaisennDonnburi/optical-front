import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "@/components/atoms/ScrollArea";

const meta: Meta<typeof ScrollArea> = {
  title: "Atoms/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "オーバーフロー時にスクロール可能な領域を提供するコンテナ。独自スクロールバーを含む。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-40 w-64 rounded-md border p-2">
      <div className="space-y-2">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="h-6 rounded bg-secondary" />
        ))}
      </div>
    </ScrollArea>
  ),
};
