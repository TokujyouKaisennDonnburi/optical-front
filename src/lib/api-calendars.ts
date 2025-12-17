import { apiGet, apiPost, apiRequest } from "@/lib/api-client";
import type {
  CalendarListResponse,
  CalendarQueryResponse,
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

export async function getCalendarDetail(calendarId: string) {
  return apiGet<CalendarQueryResponse>(`/calendars/${calendarId}`);
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/calendars", payload);
}
