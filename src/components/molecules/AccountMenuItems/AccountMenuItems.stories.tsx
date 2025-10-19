import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/atoms/DropdownMenu";
import { AccountMenuItems } from "./AccountMenuItems";
import { LogOut, User, Settings } from "lucide-react";

const meta: Meta<typeof AccountMenuItems> = {
  title: "Molecules/AccountMenuItems",
  component: AccountMenuItems,
};
export default meta;

type Story = StoryObj<typeof AccountMenuItems>;

export const WithAvatar: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Storybook用の仮ボタン */}
        <button className="px-4 py-2 border rounded">Open Menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <AccountMenuItems
          name="佐藤 花子"
          email="hanako.sato@example.com"
          avatarUrl="https://i.pravatar.cc/100"
          items={[
            {
              label: "プロフィール",
              icon: <User className="h-4 w-4" />,
              onSelect: () => console.log("プロフィール"),
            },
            {
              label: "設定",
              icon: <Settings className="h-4 w-4" />,
              onSelect: () => console.log("設定"),
            },
            {
              label: "ログアウト",
              icon: <LogOut className="h-4 w-4" />,
              onSelect: () => console.log("ログアウト"),
            },
          ]}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const WithoutAvatar: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 border rounded">Open Menu</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <AccountMenuItems
          name="山田 太郎"
          email="taro.yamada@example.com"
          items={[
            {
              label: "プロフィール",
              icon: <User className="h-4 w-4" />,
              onSelect: () => console.log("プロフィール"),
            },
            {
              label: "設定",
              icon: <Settings className="h-4 w-4" />,
              onSelect: () => console.log("設定"),
            },
            {
              label: "ログアウト",
              icon: <LogOut className="h-4 w-4" />,
              onSelect: () => console.log("ログアウト"),
            },
          ]}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
