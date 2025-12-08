import { apiGet, apiPost } from "@/lib/api-client";
import type {
  CalendarDetailResponse,
  CreateCalendarRequest,
  CreateCalendarResponse,
} from "@/types/schedule";

export async function getCalendarDetail(calendarId: string) {
  return apiGet<CalendarDetailResponse>(`/api/calendars/${calendarId}`);
}

export async function createCalendar(payload: CreateCalendarRequest) {
  return apiPost<CreateCalendarResponse>("/api/calendars", payload);
}
