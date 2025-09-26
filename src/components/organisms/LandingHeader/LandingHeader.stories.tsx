import type { Meta, StoryObj } from "@storybook/react";
import { LandingHeader } from "./LandingHeader";

const meta: Meta<typeof LandingHeader> = {
  title: "Organisms/Header",
  component: LandingHeader,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "公式サイト用の固定ヘッダー。ナビゲーションとCTAを含む。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LandingHeader>;

export const Default: Story = {};
