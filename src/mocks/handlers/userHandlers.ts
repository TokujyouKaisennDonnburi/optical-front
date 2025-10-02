import { http, HttpResponse } from "msw";

import { userMock } from "@/mocks/data/user";

export const userHandlers = [
  http.get("/api/user", () => {
    return HttpResponse.json(userMock);
  }),
];
