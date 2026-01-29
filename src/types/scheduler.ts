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
  schedulerId: string;
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

export type SchedulerAttendanceResponse = {
  userId: string;
  comment: string;
  status: {
    date: string;
    status: 1 | 2 | 3;
  }[];
};

export const getSchedulerAttendance = async (
  calendarId: string,
  schedulerId: string,
) => {
  return apiGet<SchedulerAttendanceResponse[]>(
    `/calendars/${calendarId}/schedulers/${schedulerId}/attendance`,
  );
};

export type PostSchedulerAttendanceRequest = {
  comment: string;
  status: {
    date: string;
    status: 1 | 2 | 3; // 1=ok, 2=maybe, 3=ng
  }[];
};

export const postSchedulerAttendance = async (
  calendarId: string,
  schedulerId: string,
  request: PostSchedulerAttendanceRequest,
) => {
  return apiPost(
    `/calendars/${calendarId}/schedulers/${schedulerId}/attendance`,
    request,
  );
};

export type SchedulerResultResponse = {
  ownerId: string;
  title: string;
  memo: string;
  limitTime: string;
  isAllDay: boolean;
  members: {
    userId: string;
    userName: string;
  }[];
  date: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
};

export const getSchedulerResult = async (schedulerId: string) => {
  return apiGet<SchedulerResultResponse>(`/schedulers/${schedulerId}/result`);
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
