// src/components/molecules/SearchInput/SearchInput.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: {
    placeholder: "スケジュール、参加者、場所を検索...",
  },
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    const {
      value: _value,
      onChange: _onChange,
      onSelect: _onSelect,
      ...rest
    } = args;

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...rest}
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};

export const WithInitialValue: Story = {
  render: (args) => {
    const [value, setValue] = useState("会議室A");
    const {
      value: _value,
      onChange: _onChange,
      onSelect: _onSelect,
      ...rest
    } = args;

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...rest}
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};

export const NoSuggestions: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    const {
      value: _value,
      onChange: _onChange,
      onSelect: _onSelect,
      ...rest
    } = args;

    return (
      <div style={{ width: "400px" }}>
        <SearchInput
          {...rest}
          value={value}
          onChange={setValue}
          onSelect={setValue}
        />
      </div>
    );
  },
};
