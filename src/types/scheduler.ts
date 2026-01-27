import { apiGet, apiPost } from "@/lib/api-client";

export type TeamMember = {
  id: number;
  name: string;
  available: boolean;
};

export type SchedulerSurvey = {
  title: string;
  startTime: string;
  endTime: string;
  deadlineDate: string;
  selectedDates: string[]; // Array of date strings (e.g., "YYYY-MM-DD")
  memo: string;
};

export type SchedulerListItem = {
  id: string;
  title: string;
  deadline: string;
};

export type SchedulerCardProps = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  respondersCount: number;
  hasResponded: boolean;
  isClosed?: boolean;
  limitTime?: string | null; // Added limitTime
  onClick?: (id: string, hasResponded: boolean) => void;
};

export type CandidateDate = {
  date: string; // "2026-01-07"
  start?: string; // "10:00"
  end?: string; // "11:00"
};

export type CreateSchedulerRequest = {
  title: string;
  memo: string;
  limitTime: string | null;
  isAllDay: boolean;
  dates: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
};

export type CreateSchedulerResponse = {
  id: string;
};

export const createScheduler = async (
  calendarId: string,
  request: CreateSchedulerRequest,
) => {
  return apiPost<CreateSchedulerResponse>(
    `/calendars/${calendarId}/schedulers`,
    request,
  );
};

export type SchedulerAttendaceResponse = {
  user_id: string;
  comment: string;
  status: {
    date: string;
    status: number;
  }[];
};

export const getSchedulerAttendance = async (
  calendarId: string,
  schedulerId: string,
) => {
  return apiPost<SchedulerAttendaceResponse>(
    `/calendars/${calendarId}/schedulers/${schedulerId}/attendaces`,
  );
};

export type SchedulerResponse = {
  id: string;
  calendarId: string;
  userId: string;
  title: string;
  memo: string;
  limitTime: string;
  isAllDay: boolean;
  possibleDate: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
};

export const getScheduler = async (calendarId: string, schedulerId: string) => {
  return apiGet<SchedulerResponse>(
    `/calendars/${calendarId}/schedulers/${schedulerId}`,
  );
};

export type AllSchedulerResponse = {
  id: string;
  userId: string;
  calendarId: string;
  title: string;
  memo: string;
  limitTime: string | null;
  isAllDay: boolean;
  isDone: boolean;
};

export const getSchedulerList = async (calendarId: string) => {
  return apiGet<AllSchedulerResponse[]>(`/calendars/${calendarId}/schedulers`);
};
