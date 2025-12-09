import { apiGet, apiPost, apiRequest, OPTICAL_API_URL } from "@/lib/api-client";
import type {
  CalendarDetailResponse,
  CalendarListResponse,
  CreateCalendarRequest,
  CreateCalendarResponse,
  ImageUploadResponse,
} from "@/types/schedule";

export async function getCalendarList() {
  return apiGet<CalendarListResponse>("/calendars", undefined, OPTICAL_API_URL);
}

export async function uploadCalendarImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<ImageUploadResponse>(
    "/calendars/images",
    {
      method: "POST",
      body: formData,
      isMultipart: true,
    },
    OPTICAL_API_URL,
  );
}

export async function getCalendarDetail(calendarId: string) {
  return apiGet<CalendarDetailResponse>(`/api/calendars/${calendarId}`);
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/api/calendars", payload);
}
