import { apiGet, apiPost, OPTICAL_API_URL } from "@/lib/api-client";
import type {
  CreateScheduleRequest,
  CreateScheduleResponse,
  ScheduleApiResponse,
} from "@/types/schedule";

export async function getTodaySchedule() {
  return apiGet<ScheduleApiResponse>(
    "/events/todays",
    undefined,
    OPTICAL_API_URL,
  );
}

export async function getMonthSchedule(month?: string) {
  return apiGet<ScheduleApiResponse>(
    `/events/months?month=${month || ""}`,
    undefined,
    OPTICAL_API_URL,
  );
}

export async function createSchedule(
  calendarId: string,
  body: CreateScheduleRequest,
) {
  return apiPost<CreateScheduleResponse>(
    `/calendars/${calendarId}/events`,
    body,
    undefined,
    OPTICAL_API_URL,
  );
}
