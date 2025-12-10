import { HttpResponse, http } from "msw";

import { scheduleMock } from "@/mocks/data/schedule";

/**
 * スケジュールAPIのモックハンドラー
 * ログインユーザーのスケジュールのみを返却
 */
export const scheduleHandlers = [
  http.get("http://localhost:8000/events/months", ({ request }) => {
    console.log("[MSW] GET /events/months - returning all mock data for debugging");
    
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("Authorization");
    console.log("[MSW] Auth header:", authHeader ? "present" : "missing");

    // デバッグ用: 認証なしでも全データを返す
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[MSW] No auth - returning all data for user-1");
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      const userItems = scheduleMock.items.filter(
        (item) => item.userId === "user-1",
      );
      console.log("[MSW] Returning:", { calendars: userCalendars.length, items: userItems.length });
      return HttpResponse.json({
        date: new Date().toISOString(),
        calendars: userCalendars,
        items: userItems,
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンをデコードしてユーザーIDを取得
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;
      console.log("[MSW] User ID from token:", userId);

      // トークンの有効期限チェック
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log("[MSW] Token expired");
        return HttpResponse.json(
          {
            error: {
              code: 401,
              message: "トークンの有効期限が切れています",
            },
          },
          { status: 401 },
        );
      }

      // ユーザーIDに基づいてカレンダーとスケジュールをフィルタリング
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === userId,
      );
      const userItems = scheduleMock.items.filter(
        (item) => item.userId === userId,
      );
      console.log("[MSW] Returning:", { calendars: userCalendars.length, items: userItems.length });

      return HttpResponse.json({
        date: new Date().toISOString(),
        calendars: userCalendars,
        items: userItems,
      });
    } catch (_error) {
      console.log("[MSW] Token parse error, returning all data for user-1");
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      const userItems = scheduleMock.items.filter(
        (item) => item.userId === "user-1",
      );
      return HttpResponse.json({
        date: new Date().toISOString(),
        calendars: userCalendars,
        items: userItems,
      });
    }
  }),

  http.post("http://localhost:8000/schedules", async ({ request }) => {
    console.log("[MSW] POST /api/schedules handler called");

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        { error: { code: 401, message: "認証が必要です" } },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return HttpResponse.json(
          { error: { code: 401, message: "トークンの有効期限が切れています" } },
          { status: 401 },
        );
      }

      const body = (await request.json()) as {
        title: string;
        start: string;
        end?: string;
        startDate?: string;
        endDate?: string;
        memo?: string;
        location?: string;
        locationUrl?: string;
        members?: string[];
        calendarId?: string;
        status?: string;
        isAllDay?: boolean;
      };

      const calendar = scheduleMock.calendars.find(
        (c) => c.id === body.calendarId,
      );

      const isAllDay = body.isAllDay ?? false;

      const resolveRange = () => {
        if (isAllDay && body.startDate) {
          const start = new Date(body.startDate);
          const end = new Date(body.endDate ?? body.startDate);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          return { start: start.toISOString(), end: end.toISOString() };
        }
        return { start: body.start, end: body.end };
      };

      const range = resolveRange();

      const newItem = {
        id: `schedule-${Date.now()}`,
        title: body.title,
        memo: body.memo,
        location: body.location,
        locationUrl: body.locationUrl,
        members: body.members ?? [],
        calendarId: body.calendarId,
        calendarName: calendar?.name,
        calendarColor: calendar?.color,
        status:
          (body.status as (typeof scheduleMock.items)[number]["status"]) ??
          "default",
        isAllDay,
        start: range.start,
        end: range.end,
        userId,
      } as (typeof scheduleMock.items)[number];

      console.log("[MSW] 作成されたアイテム:", newItem);
      (scheduleMock.items as unknown as Array<typeof newItem>).push(newItem);
      console.log("[MSW] 現在のアイテム数:", scheduleMock.items.length);

      return HttpResponse.json({ item: newItem }, { status: 201 });
    } catch (_error) {
      return HttpResponse.json(
        { error: { code: 401, message: "無効なトークンです" } },
        { status: 401 },
      );
    }
  }),

  http.get("http://localhost:8000/calendars", ({ request }) => {
    console.log("[MSW] GET /calendars - returning all mock data for debugging");
    
    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("Authorization");
    console.log("[MSW] Auth header:", authHeader ? "present" : "missing");

    // デバッグ用: 認証なしでも全データを返す
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[MSW] No auth - returning all calendars for user-1");
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      console.log("[MSW] Returning calendars:", userCalendars.length);
      return HttpResponse.json(userCalendars);
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンをデコードしてユーザーIDを取得
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;
      console.log("[MSW] User ID from token:", userId);

      // トークンの有効期限チェック
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log("[MSW] Token expired");
        return HttpResponse.json(
          {
            error: {
              code: 401,
              message: "トークンの有効期限が切れています",
            },
          },
          { status: 401 },
        );
      }

      // ユーザーIDに基づいてカレンダーとスケジュールをフィルタリング
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === userId,
      );
      console.log("[MSW] Returning calendars:", userCalendars.length);
      return HttpResponse.json(userCalendars);
    } catch (_error) {
      console.log("[MSW] Token parse error, returning all calendars for user-1");
      const userCalendars = scheduleMock.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      return HttpResponse.json(userCalendars);
    }
  }),

  http.post("http://localhost:8000/calendars", async ({ request }) => {
    console.log("[MSW] POST /api/calendars handler called");

    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("Authorization");

    // 認証されていない場合は401エラー
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          error: {
            code: 401,
            message: "認証が必要です",
          },
        },
        { status: 401 },
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // トークンをデコードしてユーザーIDを取得
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid token");
      }

      const payload = JSON.parse(atob(parts[1]));
      const userId = payload.sub;

      // トークンの有効期限チェック
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return HttpResponse.json(
          {
            error: {
              code: 401,
              message: "トークンの有効期限が切れています",
            },
          },
          { status: 401 },
        );
      }

      // リクエストボディを取得
      const body = await request.json();
      const { name, color, imageFileName, customOptions } = body as {
        name: string;
        color: string;
        imageFileName?: string | null;
        customOptions?: string[];
      };

      // 新しいカレンダーを作成
      const newCalendar = {
        id: `calendar-${Date.now()}`,
        name,
        color,
        userId,
        customOptions: customOptions ?? [],
        ...(imageFileName && {
          imageUrl: `https://images.unsplash.com/photo-${Math.random().toString(36).slice(2)}?auto=format&fit=crop&w=1200&q=80`,
        }),
      };

      // モックデータに追加
      (scheduleMock.calendars as unknown as Array<typeof newCalendar>).push(
        newCalendar,
      );

      return HttpResponse.json(
        {
          calendar: newCalendar,
        },
        { status: 201 },
      );
    } catch (_error) {
      return HttpResponse.json(
        {
          error: {
            code: 401,
            message: "無効なトークンです",
          },
        },
        { status: 401 },
      );
    }
  }),

  // GET /api/calendars/:id - カレンダー詳細取得
  http.get("http://localhost:8000/calendars/:id", ({ params }) => {
    const { id } = params;
    const calendar = scheduleMock.calendars.find((c) => c.id === id);

    if (!calendar) {
      return HttpResponse.json(
        {
          error: {
            code: 404,
            message: "カレンダーが見つかりません",
          },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      calendar: {
        ...calendar,
        customOptions:
          (calendar as { customOptions?: string[] }).customOptions ?? [],
      },
    });
  }),
];
