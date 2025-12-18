import type { Meta, StoryObj } from "@storybook/react";
import { HttpResponse, http } from "msw";
import MilestoneProgressOption from "./MilestoneProgressOption";

const meta: Meta<typeof MilestoneProgressOption> = {
  title: "Components/Organisms/EngineerOption/MilestoneProgressOption",
  component: MilestoneProgressOption,
};
export default meta;

type Story = StoryObj<typeof MilestoneProgressOption>;

const API_PREFIX = "http://localhost:8000";

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/api/github/milestone-progress`, async () => {
          return HttpResponse.json({
            milestones: [
              {
                name: "2025 Q1 Sprint",
                openIssues: 8,
                closedIssues: 22,
                url: "https://github.com/mock/repo/milestones/1",
              },
              {
                name: "2025 Q2 Infrastructure",
                openIssues: 2,
                closedIssues: 10,
                url: "https://github.com/mock/repo/milestones/2",
              },
              {
                name: "2025 Q2 New Features",
                openIssues: 15,
                closedIssues: 5,
                url: "https://github.com/mock/repo/milestones/3",
              },
            ],
          });
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/api/github/milestone-progress`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // 10秒待機
          return HttpResponse.json({ milestones: [] });
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/api/github/milestone-progress`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};
