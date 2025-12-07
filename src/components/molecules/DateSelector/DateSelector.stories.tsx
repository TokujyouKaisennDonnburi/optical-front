import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateSelector, type DateSelectorProps } from "./DateSelector";

const meta: Meta<typeof DateSelector> = {
  title: "Molecules/DateSelector",
  component: DateSelector,
  tags: ["autodocs"],
  args: {
    placeholder: "年月の指定",
  },
};
export default meta;

type Story = StoryObj<typeof DateSelector>;

export const Default: Story = {
  render: (args: DateSelectorProps) => {
    const [value, setValue] = useState<Date | undefined>(undefined);
    return (
      <div style={{ width: "200px" }}>
        <DateSelector {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: (args: DateSelectorProps) => {
    const [value, setValue] = useState<Date | undefined>(new Date());
    return (
      <div style={{ width: "200px" }}>
        <DateSelector
          {...args}
          label="期間"
          value={value}
          onChange={setValue}
        />
      </div>
    );
  },
};
