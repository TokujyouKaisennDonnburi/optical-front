import type { Meta, StoryObj } from "@storybook/react";
import { DatePicker } from "@/components/atoms/DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Atoms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {},
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Select a date",
  },
};

export const WithCustomClass: Story = {
  args: {
    className: "border-red-500",
  },
};
