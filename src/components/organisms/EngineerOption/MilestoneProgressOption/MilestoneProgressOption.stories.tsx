import type { Meta, StoryObj } from "@storybook/react";
import MilestoneProgressOption from "./MilestoneProgressOption";

const meta: Meta<typeof MilestoneProgressOption> = {
title: "Components/MilestoneProgressOption",
component: MilestoneProgressOption,
};
export default meta;

type Story = StoryObj<typeof MilestoneProgressOption>;

export const Default: Story = {
args: {
progress: 45,
},
};