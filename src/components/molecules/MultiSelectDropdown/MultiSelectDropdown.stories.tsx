import type { Meta, StoryObj } from "@storybook/react";
import { MultiSelectDropdown } from "./MultiSelectDropdown";
import { useState } from "react";

const meta: Meta<typeof MultiSelectDropdown> = {
  title: "Molecules/MultiSelectDropdown",
  component: MultiSelectDropdown,
  tags: ["autodocs"],
  args: {
    options: ["仕事用", "私用", "学校", "その他"],
    placeholder: "選択してください",
  },
};
export default meta;

type Story = StoryObj<typeof MultiSelectDropdown>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div style={{ width: "300px" }}>
        <MultiSelectDropdown {...args} value={value} onChange={setValue} />
      </div>
    );
  },
};
