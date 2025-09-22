import type { Meta, StoryObj } from "@storybook/react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/atoms/NavigationMenu";

const meta = {
  title: "Atoms/NavigationMenu",
  component: NavigationMenu,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof NavigationMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: null,
  },
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>全てのカレンダー</NavigationMenuTrigger>
          <NavigationMenuContent className="p-4">
            <div className="grid gap-2 text-sm">
              <NavigationMenuLink asChild>
                <a
                  className="rounded-md bg-accent px-3 py-2 text-accent-foreground"
                  href="#"
                >
                  エンジニア
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a className="rounded-md px-3 py-2 hover:bg-muted" href="#">
                  デザイナー
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a className="rounded-md px-3 py-2 hover:bg-muted" href="#">
                  カップル
                </a>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>全期間</NavigationMenuTrigger>
          <NavigationMenuContent className="p-4">
            <div className="grid gap-2 text-sm">
              <NavigationMenuLink asChild>
                <a className="rounded-md px-3 py-2 hover:bg-muted" href="#">
                  2029年
                </a>
              </NavigationMenuLink>
              <NavigationMenuLink asChild>
                <a className="rounded-md px-3 py-2 hover:bg-muted" href="#">
                  2028年
                </a>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
      <NavigationMenuIndicator />
      <NavigationMenuViewport />
    </NavigationMenu>
  ),
};
