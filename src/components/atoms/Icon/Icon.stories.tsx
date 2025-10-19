import type { Meta, StoryObj } from "@storybook/react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Icon } from "@/components/atoms/Icon";

const meta: Meta<typeof Icon> = {
  title: "Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
  args: {
    icon: Plus,
  },
  parameters: {
    docs: {
      description: {
        component:
          "Lucide アイコンをラップし、size プロップで手軽にサイズ指定可能 (sm/md/lg/number)。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg" } };
export const Trash: Story = { args: { icon: Trash2 } };
export const SearchIcon: Story = { args: { icon: Search } };
