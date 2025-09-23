// src/components/molecules/SearchInput/SearchInput.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";
import { useState } from "react";

const meta: Meta<typeof SearchInput> = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: {
    suggestions: [
      "会議室A",
      "会議室B",
      "山田太郎",
      "佐藤花子",
      "学校",
      "沖縄旅行",
      "金沢出張",
    ],
    placeholder: "スケジュール、参加者、場所を検索...",
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: args => {
    const [value, setValue] = useState("");

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...args}
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  render: args => {
    const [value, setValue] = useState("会議室A");

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...args}
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};

export const NoSuggestions: Story = {
  render: args => {
    const [value, setValue] = useState("");

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...args}
          suggestions={[]} // 候補なし
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};
