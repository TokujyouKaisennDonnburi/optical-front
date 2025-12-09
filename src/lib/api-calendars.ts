import { apiGet, apiPost, OPTICAL_API_URL } from "@/lib/api-client";
import type {
  CalendarDetailResponse,
  CalendarListResponse,
  CreateCalendarRequest,
  CreateCalendarResponse,
} from "@/types/schedule";

export async function getCalendarList() {
  return apiGet<CalendarListResponse>("/calendars", undefined, OPTICAL_API_URL);
}

export async function getCalendarDetail(calendarId: string) {
  return apiGet<CalendarDetailResponse>(`/api/calendars/${calendarId}`);
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/api/calendars", payload);
}
