import { apiGet, apiPost } from "@/lib/api-client";
import type {
  CreateScheduleRequest,
  CreateScheduleResponse,
  ScheduleApiResponse,
} from "@/types/schedule";

export async function getTodaySchedule() {
  return apiGet<ScheduleApiResponse>("/api/today-schedule");
}

export async function createSchedule(body: CreateScheduleRequest) {
  return apiPost<CreateScheduleResponse>("/api/schedules", body);
}
