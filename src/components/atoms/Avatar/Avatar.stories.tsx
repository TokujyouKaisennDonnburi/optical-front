import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Atoms/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Radix Avatar のラッパー。Avatar 内に AvatarImage / AvatarFallback を子として配置。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/100" alt="avatar" />
      <AvatarFallback>AB</AvatarFallback>
    </Avatar>
  ),
};

export const WithFallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="" alt="avatar" />
      <AvatarFallback>CD</AvatarFallback>
    </Avatar>
  ),
};
