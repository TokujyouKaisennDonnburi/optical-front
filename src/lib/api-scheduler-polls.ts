import type {
    SchedulerCreateRequest,
    SchedulerDetailResponse,
    SchedulerAddAttendanceRequest,
    SchedulerResponse,
} from "@/types/scheduler-poll";
import { apiGet, apiPost } from "./api-client";

export async function createSchedulerPoll(body: SchedulerCreateRequest) {
    return apiPost<SchedulerCreateRequest>("/calendars/${calendarId}/schedulers", body);
}
export async function addAttendancePoll(body: SchedulerAddAttendanceRequest) {
    return apiPost<SchedulerResponse>("/calendars/${calendarId}/schedulers/{schedulerId}/attendance", body);
}

export function getAllScheduler() {
    return apiGet<SchedulerResponse[]>("/calendars/{calendarId}/schedulers");
}
export function getScheduler() {
    return apiGet<SchedulerResponse[]>("/calendars/{calendarId}/schedulers/{schedulerId}");
}
export function getSchedulerAttendance() {
    return apiGet<SchedulerResponse[]>("/calendars/{calendarId}/schedulers/{schedulerId}");
}
export function getSchedulerResult() {
    return apiGet<SchedulerDetailResponse>("/calendars/{calendarId}/schedulers/{schedulerId}");
}
