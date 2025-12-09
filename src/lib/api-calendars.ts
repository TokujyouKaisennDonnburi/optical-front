import { apiGet, apiPost, OPTICAL_API_URL } from "@/lib/api-client";
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
  return apiPost<ImageUploadResponse>(
    "/calendars/images/",
    formData,
    undefined,
    OPTICAL_API_URL,
  );
}

export async function getCalendarDetail(calendarId: string) {
  return apiGet<CalendarDetailResponse>(`/api/calendars/${calendarId}`);
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/api/calendars", payload);
}
