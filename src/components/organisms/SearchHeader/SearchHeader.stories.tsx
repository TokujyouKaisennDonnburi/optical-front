import type { Meta, StoryObj } from "@storybook/react";
import SearchHeader from "./SearchHeader";

const meta: Meta<typeof SearchHeader> = {
  title: "Organisms/SearchHeader",
  component: SearchHeader,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof SearchHeader>;

export const Default: Story = {
  render: () => <SearchHeader />,
};

export const WithPreselectedFilters: Story = {
  render: () => {
    // Wrapper コンポーネントを使って初期値を設定する
    return (
      <div className="space-y-4">
        <SearchHeader />
      </div>
    );
  },
};
