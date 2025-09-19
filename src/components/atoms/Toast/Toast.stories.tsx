import type { Meta, StoryObj } from "@storybook/react";
import { Toaster, toast } from "@/components/atoms/Toast";
import { Button } from "@/components/atoms/Button";

const meta: Meta = {
  title: "Atoms/Toast",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "sonner を用いた Toaster と toast API。ページルートに <Toaster /> を配置して使用。",
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <Button onClick={() => toast.success("保存しました")}>Show Toast</Button>
    </div>
  ),
};
