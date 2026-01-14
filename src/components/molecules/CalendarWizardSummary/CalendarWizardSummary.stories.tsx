import type { Meta, StoryObj } from "@storybook/react";

import { CalendarWizardSummary } from "./CalendarWizardSummary";

const meta: Meta<typeof CalendarWizardSummary> = {
  title: "Molecules/CalendarWizardSummary",
  component: CalendarWizardSummary,
  tags: ["autodocs"],
  args: {
    name: "開発スプリント",
    color: "#22c55e",
    imagePreviewUrl: null,
    templateName: "Dev",
    customOptions: [
      { name: "reminder_digest", label: "リマインダーサマリメール" },
      { name: "task_inbox", label: "インボックス連携" },
    ],
    members: [
      { id: "1", email: "owner@example.com" },
      { id: "2", email: "member@example.com" },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof CalendarWizardSummary>;

export const Default: Story = {};

export const WithoutMembers: Story = {
  args: {
    members: [],
  },
};

export const WithImagePreview: Story = {
  args: {
    imagePreviewUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
};
