import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Calendar } from "@/components/atoms/Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Atoms/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "react-day-picker を用いたカレンダー。single/multiple/range などのモードをサポート。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof Calendar>;

export const Single: Story = {
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return (
      <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
    );
  },
};
