import { apiGet } from "@/lib/api-client";
import type { ScheduleApiResponse } from "@/types/schedule";

export async function getTodaySchedule() {
  return apiGet<ScheduleApiResponse>("/api/today-schedule");
}
