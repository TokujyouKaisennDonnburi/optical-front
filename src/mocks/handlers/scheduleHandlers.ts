import { HttpResponse, http } from "msw";

import { scheduleStore } from "@/mocks/data/scheduleStore";

/**
 * スケジュールAPIのモックハンドラー
 * ログインユーザーのスケジュールのみを返却
 */
export const scheduleHandlers = [
  http.get("http://localhost:8000/events/months", ({ request }) => {
    console.log(
      "[MSW] GET /events/months - returning all mock data for debugging",
    );

    // Authorization ヘッダーからトークンを取得
    const authHeader = request.headers.get("Authorization");
    console.log("[MSW] Auth header:", authHeader ? "present" : "missing");

    // デバッグ用: 認証なしでも全データを返す
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[MSW] No auth - returning all data for user-1");
      const userCalendars = scheduleStore.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      const userItems = scheduleStore.items.filter(
        (item) => item.userId === "user-1",
      );
      console.log("[MSW] Returning:", {
        calendars: userCalendars.length,
        items: userItems.length,
      });
      return HttpResponse.json({
        date: new Date().toISOString(),
        items: userItems.map((item) => ({
          calendarId: item.calendarId,
          calendarName: item.calendarName,
          calendarColor: item.calendarColor,
          id: item.id,
          title: item.title,
          location: item.location,
          memo: item.memo,
          startAt: item.startAt,
          endAt: item.endAt,
          isAllDay: item.isAllDay ?? false,
        })),
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
      const userCalendars = scheduleStore.calendars.filter(
        (calendar) => calendar.userId === userId,
      );
      const userItems = scheduleStore.items.filter(
        (item) => item.userId === userId,
      );
      console.log("[MSW] Returning:", {
        calendars: userCalendars.length,
        items: userItems.length,
      });

      return HttpResponse.json({
        date: new Date().toISOString(),
        items: userItems.map((item) => ({
          calendarId: item.calendarId,
          calendarName: item.calendarName,
          calendarColor: item.calendarColor,
          id: item.id,
          title: item.title,
          location: item.location,
          memo: item.memo,
          startAt: item.startAt,
          endAt: item.endAt,
          isAllDay: item.isAllDay ?? false,
        })),
      });
    } catch (_error) {
      console.log("[MSW] Token parse error, returning all data for user-1");
      const userItems = scheduleStore.items.filter(
        (item) => item.userId === "user-1",
      );
      return HttpResponse.json({
        date: new Date().toISOString(),
        items: userItems.map((item) => ({
          calendarId: item.calendarId,
          calendarName: item.calendarName,
          calendarColor: item.calendarColor,
          id: item.id,
          title: item.title,
          location: item.location,
          memo: item.memo,
          startAt: item.startAt,
          endAt: item.endAt,
          isAllDay: item.isAllDay ?? false,
        })),
      });
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
      const userCalendars = scheduleStore.calendars.filter(
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
      const userCalendars = scheduleStore.calendars.filter(
        (calendar) => calendar.userId === userId,
      );
      console.log("[MSW] Returning calendars:", userCalendars.length);
      return HttpResponse.json(userCalendars);
    } catch (_error) {
      console.log(
        "[MSW] Token parse error, returning all calendars for user-1",
      );
      const userCalendars = scheduleStore.calendars.filter(
        (calendar) => calendar.userId === "user-1",
      );
      return HttpResponse.json(userCalendars);
    }
  }),

  // POST /calendars/images - 画像アップロード
  http.post("http://localhost:8000/calendars/images", async ({ request }) => {
    console.log("[MSW] POST /calendars/images handler called");

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

    // FormDataを取得（実際には使用しないがリクエストを消費するため）
    try {
      await request.formData();
    } catch (e) {
      console.warn("[MSW] FormData parse warning:", e);
    }

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 300));

    // モック画像データを返す（ImageUploadResponse型に合わせる）
    const mockImageId = `mock-image-${Date.now()}`;
    const mockImageUrl = `https://picsum.photos/seed/${mockImageId}/800/400`;

    return HttpResponse.json(
      {
        id: mockImageId,
        url: mockImageUrl,
      },
      { status: 200 },
    );
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
      const { name, color, imageFileName, options } = body as {
        name: string;
        color: string;
        imageFileName?: string | null;
        options?: string[];
      };

      // 新しいカレンダーを作成
      const newCalendar = {
        id: `calendar-${Date.now()}`,
        name,
        color,
        userId,
        options: options ?? [],
        ...(imageFileName && {
          imageUrl: `https://images.unsplash.com/photo-${Math.random()
            .toString(36)
            .slice(2)}?auto=format&fit=crop&w=1200&q=80`,
        }),
      };

      // モックデータに追加
      (scheduleStore.calendars as unknown as Array<typeof newCalendar>).push(
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

  // POST /calendars/:calendarId/events - スケジュール作成
  http.post(
    "http://localhost:8000/calendars/:calendarId/events",
    async ({ request, params }) => {
      console.log("[MSW] POST /calendars/:calendarId/events handler called");
      const { calendarId } = params;

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
            {
              error: { code: 401, message: "トークンの有効期限が切れています" },
            },
            { status: 401 },
          );
        }

        const body = (await request.json()) as {
          title: string;
          startTime?: string;
          endTime?: string;
          memo?: string;
          location?: string;
          locationUrl?: string;
          members?: string[];
          isAllDay?: boolean;
        };

        const calendar = scheduleStore.calendars.find(
          (c) => c.id === calendarId,
        );

        if (!calendar) {
          return HttpResponse.json(
            { error: { code: 404, message: "カレンダーが見つかりません" } },
            { status: 404 },
          );
        }

        const isAllDay = body.isAllDay ?? false;

        const newItem = {
          id: `schedule-${Date.now()}`,
          title: body.title,
          memo: body.memo,
          location: body.location,
          locationUrl: body.locationUrl,
          members: body.members ?? [],
          calendarId: calendarId as string,
          calendarName: calendar.name,
          calendarColor: calendar.color,
          status: "default" as const,
          isAllDay,
          startAt: body.startTime,
          endAt: body.endTime,
          userId,
        };

        console.log("[MSW] 作成されたアイテム:", newItem);
        (scheduleStore.items as unknown as Array<typeof newItem>).push(newItem);
        console.log("[MSW] 現在のアイテム数:", scheduleStore.items.length);

        return HttpResponse.json({ id: newItem.id }, { status: 201 });
      } catch (_error) {
        return HttpResponse.json(
          { error: { code: 401, message: "無効なトークンです" } },
          { status: 401 },
        );
      }
    },
  ),

  // GET /api/calendars/:id - カレンダー詳細取得
  http.get("http://localhost:8000/calendars/:id", ({ params }) => {
    const { id } = params;
    console.log("[MSW] GET /calendars/:id handler called, id:", id);
    const calendar = scheduleStore.calendars.find((c) => c.id === id);

    if (!calendar) {
      console.log("[MSW] Calendar not found:", id);
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

    console.log("[MSW] Returning calendar:", calendar);
    // CalendarDetailApiResponse形式で返す（calendarでラップしない）
    return HttpResponse.json({
      id: calendar.id,
      name: calendar.name,
      color: calendar.color,
      imageUrl: calendar.imageUrl,
      // モックデータにはメンバー情報が含まれていないため、空配列を返す
      // 将来的にメンバー機能を実装する際に、scheduleStore.calendarsにmemberプロパティを追加する
      member: [],
      // options配列をoption配列形式に変換
      option: (calendar.options ?? []).map((name, index) => ({
        id: index + 1,
        name,
        deprecated: false,
      })),
    });
  }),

  // DELETE /calendars/:calendarId/events/:eventId - スケジュール削除
  http.delete(
    "http://localhost:8000/calendars/:calendarId/events/:eventId",
    ({ params, request }) => {
      const { calendarId, eventId } = params;

      console.log(
        "[MSW] DELETE /calendars/:calendarId/events/:eventId",
        calendarId,
        eventId,
      );

      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return HttpResponse.json(
          { error: { code: 401, message: "認証が必要です" } },
          { status: 401 },
        );
      }

      // 実際に mock の配列から削除する
      const before = scheduleStore.items.length;

      scheduleStore.items = scheduleStore.items.filter(
        (item) => item.id !== eventId,
      );

      const after = scheduleStore.items.length;

      console.log("[MSW] 削除前:", before, "削除後:", after);

      return HttpResponse.json({ success: true }, { status: 200 });
    },
  ),
];
