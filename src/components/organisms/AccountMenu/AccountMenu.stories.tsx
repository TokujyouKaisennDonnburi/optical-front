import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenu } from "./AccountMenu";

const meta: Meta<typeof AccountMenu> = {
  title: "Organisms/AccountMenu",
  component: AccountMenu,
  tags: ["autodocs"],
  args: {
    name: "user_name",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  },
};
export default meta;

type Story = StoryObj<typeof AccountMenu>;

export const Default: Story = {
  render: (args) => {

    return (
      <div style={{ width: "200px" }}>
        <AccountMenu {...args} />
      </div>
    );
  },
};
