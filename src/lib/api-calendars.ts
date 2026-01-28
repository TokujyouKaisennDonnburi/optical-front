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
