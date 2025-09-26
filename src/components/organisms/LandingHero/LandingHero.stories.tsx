import type { Meta, StoryObj } from "@storybook/react";
import { LandingHero } from "./LandingHero";

const meta: Meta<typeof LandingHero> = {
  title: "Organisms/LandingHero",
  component: LandingHero,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "トップページ用のHeroセクション。中央揃えでキャッチコピーとCTAボタンを表示。",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof LandingHero>;
export const Default: Story = {};
