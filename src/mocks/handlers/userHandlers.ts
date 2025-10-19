import { http, HttpResponse } from "msw";

import { userMock } from "@/mocks/data/user";

// ユーザー情報取得エンドポイントのモックハンドラ
export const userHandlers = [
  http.get("/api/user", () => {
    // モックデータを返す
    return HttpResponse.json(userMock);
  }),
];
