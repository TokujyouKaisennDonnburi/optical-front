import type { Meta, StoryObj } from "@storybook/react";
import { SearchCalendar } from "@/components/atoms/SearchCalendar";

const meta: Meta<typeof SearchCalendar> = {
  title: "Atoms/SearchCalendar",
  component: SearchCalendar,
  tags: ["autodocs"],
  args: {
    label: "日付を選択",
    value: undefined,
  },
  parameters: {
    docs: {
      description: {
        component:
          "日付選択用カレンダーコンポーネント。label付きで表示可能。選択した日付を onChange で取得します。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof SearchCalendar>;

// デフォルト（ラベル付き）
export const Default: Story = {};

// 初期値あり
export const WithInitialDate: Story = {
  args: { value: new Date() },
};

// ラベルなし
export const WithoutLabel: Story = {
  args: { label: undefined },
};
