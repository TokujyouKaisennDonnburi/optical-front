import type {
    SchedulerCreateRequest,
    SchedulerDetailResponse,
    SchedulerAddAttendanceRequest,
    SchedulerResponse,
    SchedulerPollResponse,
    SchedulerPollDetailResponse,
    SchedulerPollCreateRequest,
} from "@/types/scheduler-poll";
import { apiGet, apiPost } from "./api-client";

export async function createSchedulerPoll(body: SchedulerPollCreateRequest) {
    return apiPost<SchedulerPollResponse>("/scheduler-polls", body);
}

export async function addAttendancePoll(calendarId: string, schedulerId: string, body: SchedulerAddAttendanceRequest) {
    return apiPost<SchedulerResponse>(`/calendars/${calendarId}/schedulers/${schedulerId}/attendance`, body);
}

export function getAllScheduler(calendarId: string) {
    return apiGet<SchedulerPollResponse[]>(`/calendars/${calendarId}/schedulers`);
}

export function getSchedulerPoll(schedulerId: string) {
    return apiGet<SchedulerPollDetailResponse>(`/scheduler-polls/${schedulerId}`);
}

export function getSchedulerAttendance(calendarId: string, schedulerId: string) {
    return apiGet<SchedulerResponse[]>(`/calendars/${calendarId}/schedulers/${schedulerId}`);
}

export function getSchedulerResult(calendarId: string, schedulerId: string) {
    return apiGet<SchedulerDetailResponse>(`/calendars/${calendarId}/schedulers/${schedulerId}`);
}
