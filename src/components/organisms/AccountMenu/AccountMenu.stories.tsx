import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenu } from "./AccountMenu";

const meta: Meta<typeof AccountMenu> = {
  title: "Organisms/AccountMenu",
  component: AccountMenu,
  args: {
    menuWidthClass: "w-60",
    avatarSizeClass: "h-12 w-12",
  },
};
export default meta;
type Story = StoryObj<typeof AccountMenu>;

export const Default: Story = {
  args: {
    user: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      iconUrl: "https://i.pravatar.cc/100?img=10",
    },
  },
};

export const WithLongText: Story = {
  args: {
    user: {
      id: "2",
      name: "Johnathan Verylongusername Example",
      email: "verylongemailaddress@example-domain.com",
      iconUrl: "https://i.pravatar.cc/100?img=20",
    },
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: {
      id: "3",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      iconUrl: undefined,
    },
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    user: null,
  },
};

export const ErrorState: Story = {
  args: {
    error: new Error("ユーザー情報の取得に失敗しました"),
    user: null,
  },
};

export const NoUser: Story = {
  args: {
    user: null,
  },
};
