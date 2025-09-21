import { http, HttpResponse } from "msw";

import { todayScheduleMock } from "@/mocks/data/todaySchedule";

export const todayScheduleHandlers = [
  http.get("/api/today-schedule", () => {
    return HttpResponse.json(todayScheduleMock);
  }),
];
