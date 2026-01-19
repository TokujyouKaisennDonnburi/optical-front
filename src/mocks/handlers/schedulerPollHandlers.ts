import { HttpResponse, http } from "msw";
import type {
  SchedulerPollCreateRequest,
  SchedulerPollDetailResponse,
  SchedulerPollResponse,
} from "@/types/scheduler-poll";

// Assuming the current user is Alice (user-1) for mocking `hasResponded`
const CURRENT_USER_ID = "user-1";

// In-memory "database"
const mockPollDetail1: SchedulerPollDetailResponse = {
  id: "poll-12345",
  title: "Q1 Team Offsite Planning",
  memo: "Let's decide on a date for our team offsite.",
  dates: [
    { date: "2024-03-15", startTime: "10:00", endTime: "18:00" },
    { date: "2024-03-18", startTime: "10:00", endTime: "18:00" },
    { date: "2024-03-22", startTime: "10:00", endTime: "18:00" },
  ],
  submissions: [
    {
      user: { id: "user-1", name: "Alice" },
      availabilities: {
        "2024-03-15": "ok",
        "2024-03-18": "maybe",
        "2024-03-22": "ng",
      },
      comment: "I have a conflicting appointment on the 18th.",
    },
    {
      user: { id: "user-2", name: "Bob" },
      availabilities: {
        "2024-03-15": "ok",
        "2024-03-18": "ok",
        "2024-03-22": "ok",
      },
      comment: "All dates work for me!",
    },
  ],
};

const mockPollDetail2: SchedulerPollDetailResponse = {
  id: "poll-67890",
  title: "Project Phoenix Launch Party",
  memo: "When should we celebrate our big launch?",
  dates: [
    { date: "2024-04-05", startTime: "19:00", endTime: "22:00" },
    { date: "2024-04-12", startTime: "19:00", endTime: "22:00" },
  ],
  submissions: [
    {
      user: { id: "user-2", name: "Bob" },
      availabilities: {
        "2024-04-05": "ok",
        "2024-04-12": "ok",
      },
      comment: "Both Fridays are great!",
    },
  ],
};

const pollDetailsDb: Record<string, SchedulerPollDetailResponse> = {
  "poll-12345": mockPollDetail1,
  "poll-67890": mockPollDetail2,
};

const schedulerPolls: SchedulerPollResponse[] = Object.values(
  pollDetailsDb,
).map((detail) => ({
  id: detail.id,
  title: detail.title,
  memo: detail.memo,
  limitTime: null, // You can add this if needed
  author: detail.submissions[0]?.user.name || "Unknown",
  createdAt: new Date().toISOString(),
  respondersCount: detail.submissions.length,
  hasResponded: detail.submissions.some(
    (sub) => sub.user.id === CURRENT_USER_ID,
  ),
}));

const API_BASE_URL = "http://localhost:8000";

export const schedulerPollHandlers = [
  // Handles GET /scheduler-polls
  http.get(`${API_BASE_URL}/scheduler-polls`, () => {
    return HttpResponse.json(schedulerPolls);
  }),

  // Handles GET /scheduler-polls/:id
  http.get(`${API_BASE_URL}/scheduler-polls/:id`, ({ params }) => {
    const { id } = params;
    const pollDetail = pollDetailsDb[id as string];

    if (pollDetail) {
      return HttpResponse.json(pollDetail);
    }
    return HttpResponse.json(
      { message: "Scheduler poll not found" },
      { status: 404 },
    );
  }),

  // Handles POST /scheduler-polls
  http.post<never, SchedulerPollCreateRequest>(
    `${API_BASE_URL}/scheduler-polls`,
    async ({ request }) => {
      const newPollData = await request.json();

      const newPoll: SchedulerPollResponse = {
        id: `poll-${Date.now()}`,
        title: newPollData.title,
        memo: newPollData.memo,
        limitTime: newPollData.limitTime,
        author: "Mock User",
        createdAt: new Date().toISOString(),
        respondersCount: 1, // The creator is the first responder
        hasResponded: true,
      };

      // This part is tricky for a mock. We'd need to create a new detail entry too.
      // For now, we just add it to the basic list.
      schedulerPolls.push(newPoll);

      return HttpResponse.json(newPoll, { status: 201 });
    },
  ),
];
