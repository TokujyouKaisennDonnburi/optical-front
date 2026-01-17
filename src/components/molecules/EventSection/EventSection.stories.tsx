import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { type EventItem, EventSection } from "./EventSection";

const sampleItems: EventItem[] = [
  {
    id: "1",
    title: "全社会議",
    calendarColor: "#2563eb", // blue-600
  },
  {
    id: "2",
    title: "システムメンテナンス",
    calendarColor: "#dc2626", // red-600
  },
  {
    id: "3",
    title: "社内イベント",
    calendarColor: "#16a34a", // green-600
  },
];

const meta: Meta<typeof EventSection> = {
  title: "Molecules/EventSection",
  component: EventSection,
  parameters: {
    layout: "centered",
  },
  args: {
    items: sampleItems,
    isOpen: true,
    maxHeight: 240,
  },
};

export default meta;

type Story = StoryObj<typeof EventSection>;

/**
 * Storybook上で開閉できるラッパー
 */
function WithToggle(args: React.ComponentProps<typeof EventSection>) {
  const [open, setOpen] = useState(args.isOpen);

  return (
    <div className="w-[360px]">
      <EventSection
        {...args}
        isOpen={open}
        onToggle={() => setOpen((v) => !v)}
      />
    </div>
  );
}

/**
 * デフォルト（Open）
 */
export const Default: Story = {
  render: (args) => <WithToggle {...args} />,
};

/**
 * 初期状態が Close
 */
export const Closed: Story = {
  args: {
    isOpen: false,
  },
  render: (args) => <WithToggle {...args} />,
};

/**
 * アイテムが多い（スクロール確認）
 */
export const ManyItems: Story = {
  args: {
    items: Array.from({ length: 12 }).map((_, i) => ({
      id: String(i),
      title: `終日イベント ${i + 1}`,
      calendarColor: i % 2 === 0 ? "#2563eb" : "#16a34a",
    })),
    maxHeight: 160,
  },
  render: (args) => <WithToggle {...args} />,
};

/**
 * 長いタイトル（省略確認）
 */
export const LongTitles: Story = {
  args: {
    items: [
      {
        id: "1",
        title:
          "とてもとても長いタイトルの終日イベントがどのように表示されるかを確認するためのテストケース",
        calendarColor: "#7c3aed", // violet-600
      },
      {
        id: "2",
        title:
          "さらに長いタイトルの終日イベントが入った場合のレイアウト崩れ確認用データです",
        calendarColor: "#0ea5e9", // sky-500
      },
    ],
  },
  render: (args) => <WithToggle {...args} />,
};
