import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenuItems, AccountMenuItem } from "./AccountMenuItems";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/atoms/DropdownMenu";
import { Button } from "@/components/atoms/Button";
import { LogOut } from "lucide-react";

const meta: Meta<typeof AccountMenuItems> = {
  title: "Molecules/AccountMenuItems",
  component: AccountMenuItems,
  tags: ["autodocs"],
  args: {
    name: "user name",
    items: [
      { label: "ログアウト", icon: <LogOut className="h-4 w-4" /> } as AccountMenuItem,
    ],
  },
};
export default meta;

type Story = StoryObj<typeof AccountMenuItems>;

export const Default: Story = {
  render: (args) => (
    <DropdownMenu>
      {/* メニューを開くためのボタン */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open Menu</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={4}>
        {/* AccountMenuItems をそのまま配置 */}
        <AccountMenuItems {...args} />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
