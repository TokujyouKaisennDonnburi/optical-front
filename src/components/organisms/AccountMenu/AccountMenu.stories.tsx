import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenu } from "./AccountMenu";
import { fn } from "@storybook/test";

const meta: Meta<typeof AccountMenu> = {
  title: "Organisms/AccountMenu",
  component: AccountMenu,
  args: {
    name: "Johnathan Verylongusername Example",
    email: "verylongemailaddress@example-domain.com",
    avatarUrl: "https://i.pravatar.cc/100",
    menuWidthClass: "w-60",
    avatarSizeClass: "h-12 w-12",
  },
};
export default meta;
type Story = StoryObj<typeof AccountMenu>;

export const Default: Story = {
  args: {
    name: "John Doe",
    email: "john.doe@example.com",
  },
};

export const WithLongText: Story = {
  args: {
    name: "Johnathan Verylongusername Example",
    email: "verylongemailaddress@example-domain.com",
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    avatarUrl: undefined,
  },
};
