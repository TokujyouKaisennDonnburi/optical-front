import { apiGet, apiPost, apiRequest } from "@/lib/api-client";
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
  return {
    calendar: {
      id: apiResponse.id,
      name: apiResponse.name,
      color: apiResponse.color,
      imageUrl: apiResponse.imageUrl,
      // option 配列から name を抽出して options 配列に変換
      options:
        apiResponse.option
          ?.filter((opt) => !opt.deprecated)
          .map((opt) => opt.name) ?? [],
    },
  };
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/calendars", payload);
}
