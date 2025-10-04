import { http, HttpResponse } from "msw";

import { scheduleMock } from "@/mocks/data/schedule";

export const scheduleHandlers = [
  http.get("/api/today-schedule", () => {
    return HttpResponse.json(scheduleMock);
  }),
];
