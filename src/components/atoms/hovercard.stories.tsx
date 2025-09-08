import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/atoms/HoverCard";

const meta: Meta<typeof HoverCard> = {
  title: "Atoms/HoverCard",
  component: HoverCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "ホバー時にコンテンツを表示するカード。Trigger と Content を組み合わせて使用。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger>
        <span className="underline cursor-pointer">Hover me</span>
      </HoverCardTrigger>
      <HoverCardContent>
        Hover content goes here.
      </HoverCardContent>
    </HoverCard>
  ),
};
