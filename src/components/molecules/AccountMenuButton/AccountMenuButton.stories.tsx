import type { Meta, StoryObj } from "@storybook/react";
import { AccountMenuButton } from "./AccountMenuButton";
import { useState } from "react";

const meta: Meta<typeof AccountMenuButton> = {
  title: "Molecules/AccountMenuButton",
  component: AccountMenuButton,
  tags: ["autodocs"],
  args: {
    name: "user name",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
    avatarSizeClass: "h-12 w-12",
  },
};
export default meta;

type Story = StoryObj<typeof AccountMenuButton>;

export const Default: Story = {
  render: (args) => {
    return (
      <div style={{ width: "100px" }}>
        <AccountMenuButton {...args} onClick={() => alert("クリックされました")} />
      </div>
    );
  },
};
