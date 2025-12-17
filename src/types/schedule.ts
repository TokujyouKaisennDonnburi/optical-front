export type ScheduleItem = {
  calendarId: string;
  calendarName: string;
  calendarColor: string;
  id: string;
  title: string;
  memo: string;
  location: string;
  members?: string[];
  isAllDay: boolean;
  startAt: string;
  endAt: string;
};

export type CalendarQueryResponse = {
  id: string;
  name: string;
  color: string;
  imageUrl?: string;
  options?: string[];
};

export type CalendarDetail = CalendarQueryResponse;

export type ScheduleApiResponse = {
  date: string;
  items: ScheduleItem[];
};

export type CalendarDetailResponse = {
  calendar: CalendarDetail;
};

export type ImageUploadResponse = {
  id: string;
  url: string;
};

export type CreateScheduleRequest = {
  title: string;
  startTime: string; // ISO string (timed event) or day start (all-day)
  endTime: string; // ISO string (timed event) or day end (all-day)
  memo: string;
  location: string;
  isAllDay: boolean;
};

export type CreateScheduleResponse = {
  id: string;
};

export type CalendarListResponse = CalendarQueryResponse[];

export type CreateCalendarRequest = {
  name: string;
  color: string;
  members: string[];
  options: string[];
  imageId: string | null;
};

export type CreateCalendarResponse = {
  calendar: CalendarDetail;
};
