import type { Meta, StoryObj } from "@storybook/react";
import { HttpResponse, http } from "msw";
import MilestoneProgressOption from "./MilestoneProgressOption";

const meta: Meta<typeof MilestoneProgressOption> = {
  title: "Components/Organisms/EngineerOption/MilestoneProgressOption",
  component: MilestoneProgressOption,
  args: {
    calendarId: "mock-calendar-id",
  },
};
export default meta;

type Story = StoryObj<typeof MilestoneProgressOption>;

const API_PREFIX = "http://localhost:8000";

export const Default: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/github/calendars/:calendarId/milestones`, async () => {
          return HttpResponse.json([
            {
              title: "2025 Q1 Sprint",
              progress: 73,
              open: 8,
              close: 22,
            },
            {
              title: "2025 Q2 Infrastructure",
              progress: 83,
              open: 2,
              close: 10,
            },
            {
              title: "2025 Q2 New Features",
              progress: 25,
              open: 15,
              close: 5,
            },
          ]);
        }),
      ],
    },
  },
};

export const Loading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/github/calendars/:calendarId/milestones`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // 10秒待機
          return HttpResponse.json([]);
        }),
      ],
    },
  },
};

export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(`${API_PREFIX}/github/calendars/:calendarId/milestones`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      ],
    },
  },
};
