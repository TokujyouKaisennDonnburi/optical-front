import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuArrow,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Atoms/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Radix DropdownMenu のラッパー。Trigger/Content/Item などの派生コンポーネントと組み合わせてメニューを構成します。",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">メニューを開く</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuArrow />
        <DropdownMenuLabel>アカウント</DropdownMenuLabel>
        <DropdownMenuItem>
          プロフィール
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>設定</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>テーマ</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>ライト</DropdownMenuItem>
              <DropdownMenuItem>ダーク</DropdownMenuItem>
              <DropdownMenuItem>システム</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuCheckboxItem defaultChecked>通知を有効にする</DropdownMenuCheckboxItem>
          <DropdownMenuRadioGroup defaultValue="ja">
            <DropdownMenuLabel inset>言語</DropdownMenuLabel>
            <DropdownMenuRadioItem value="ja">日本語</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
