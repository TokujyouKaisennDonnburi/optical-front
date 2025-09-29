import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenuButton } from "./AccountMenuButton";

const meta: Meta<typeof AccountMenuButton> = {
  title: "Molecules/AccountMenuButton",
  component: AccountMenuButton,
  args: {
    name: "John Doe",
    avatarUrl: "https://i.pravatar.cc/100",
    avatarSizeClass: "h-12 w-12",
  },
};
export default meta;
type Story = StoryObj<typeof AccountMenuButton>;

export const Default: Story = {};

export const WithoutAvatar: Story = {
  args: {
    avatarUrl: undefined,
    name: "Jane Doe",
  },
};
