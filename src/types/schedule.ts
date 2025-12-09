export type ScheduleStatus =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type ScheduleItem = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarId?: string;
  calendarName?: string;
  status: ScheduleStatus;
  isAllDay?: boolean;
  start: string;
  end?: string;
  calendarColor?: string;
};

export type ScheduleCalendar = {
  id: string;
  name: string;
  color: string;
  description?: string;
  imageUrl?: string;
  customOptions?: string[];
};

export type CalendarDetail = ScheduleCalendar;

export type ScheduleApiResponse = {
  date?: string;
  items: ScheduleItem[];
  calendars?: ScheduleCalendar[];
};

export type CalendarDetailResponse = {
  calendar: CalendarDetail;
};

export type CreateScheduleRequest = {
  title: string;
  start: string; // ISO string (timed event) or day start (all-day)
  end?: string; // ISO string (timed event) or day end (all-day)
  startDate?: string; // optional day-only for all-day UX
  endDate?: string; // optional day-only for all-day UX
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarId?: string;
  status?: ScheduleStatus;
  isAllDay?: boolean;
};

export type CreateScheduleResponse = {
  item: ScheduleItem;
};

export type CreateCalendarRequest = {
  name: string;
  color: string;
  members: string[];
  template: string;
  customOptions: string[];
  imageFileName: string | null;
};

export type CreateCalendarResponse = {
  calendar: CalendarDetail;
};
