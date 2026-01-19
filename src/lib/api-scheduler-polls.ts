import type {
  SchedulerPollCreateRequest,
  SchedulerPollDetailResponse,
  SchedulerPollResponse,
} from "@/types/scheduler-poll";
import { apiGet, apiPost } from "./api-client";

export function createSchedulerPoll(body: SchedulerPollCreateRequest) {
  return apiPost<SchedulerPollResponse>("/scheduler-polls", body);
}

export function getSchedulerPolls() {
  return apiGet<SchedulerPollResponse[]>("/scheduler-polls");
}

export function getSchedulerPoll(id: string) {
  return apiGet<SchedulerPollDetailResponse>(`/scheduler-polls/${id}`);
}
