import { apiDelete, apiGet, apiPost } from "@/lib/api-client";
import type {
  CreateScheduleRequest,
  CreateScheduleResponse,
  ScheduleApiResponse,
} from "@/types/schedule";

export async function getTodaySchedule() {
  return apiGet<ScheduleApiResponse>("/events/todays");
}

export async function getMonthSchedule(month?: string) {
  return apiGet<ScheduleApiResponse>(`/events/months?month=${month || ""}`);
}

export async function createSchedule(
  calendarId: string,
  body: CreateScheduleRequest,
) {
  return apiPost<CreateScheduleResponse>(
    `/calendars/${calendarId}/events`,
    body,
  );
}

export async function deleteSchedule(calendarId: string, eventId: string) {
  return apiDelete(`/calendars/${calendarId}/events/${eventId}`);
}
