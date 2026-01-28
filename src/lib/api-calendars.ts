import { apiGet, apiPatch, apiPost, apiRequest } from "@/lib/api-client";
import type {
  CalendarDetailApiResponse,
  CalendarDetailResponse,
  CalendarListResponse,
  CreateCalendarRequest,
  CreateCalendarResponse,
  ImageUploadResponse,
} from "@/types/schedule";

export async function getCalendarList() {
  return apiGet<CalendarListResponse>("/calendars", undefined);
}

export async function uploadCalendarImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<ImageUploadResponse>("/calendars/images", {
    method: "POST",
    body: formData,
    isMultipart: true,
  });
}

export async function getCalendarDetail(
  calendarId: string,
): Promise<CalendarDetailResponse> {
  // バックエンドのレスポンスを取得
  const apiResponse = await apiGet<CalendarDetailApiResponse>(
    `/calendars/${calendarId}`,
  );

  // フロントエンド用の形式に変換
  const options =
    apiResponse.option
      ?.filter((opt) => !opt.deprecated)
      .map((opt) => opt.name) ?? [];

  return {
    calendar: {
      id: apiResponse.id,
      name: apiResponse.name,
      color: apiResponse.color,
      imageUrl: apiResponse.imageUrl,
      options,
      members: apiResponse.member?.map((m) => ({
        userId: m.userId,
        name: m.name,
        joinedAt: m.joinedAt,
        avatarUrl: m.avatarUrl,
      })),
    },
  };
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/calendars", payload);
}

export async function joinCalendar(calendarId: string) {
  return apiPatch<void>(`/calendars/${calendarId}/members`);
}

export async function deleteCalendar(calendarId: string) {
  return apiRequest<void>(`/calendars/${calendarId}`, {
    method: "DELETE",
  });
}

/** メンバー招待 */
export async function inviteMembers(calendarId: string, emails: string[]) {
  return apiPost<void>(`/calendars/${calendarId}/members`, { emails });
}

/** メンバー一覧取得 */
export async function getCalendarMembers(calendarId: string) {
  return apiGet<
    Array<{
      userId: string;
      name: string;
      email?: string;
      avatarUrl?: string;
      status: "pending" | "joined";
      joinedAt?: string;
    }>
  >(`/calendars/${calendarId}/members`);
}

/** カレンダー退出（招待拒否） */
export async function leaveCalendar(calendarId: string) {
  return apiRequest<void>(`/calendars/${calendarId}/members`, {
    method: "DELETE",
  });
}
