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

// バックエンドのカレンダー詳細レスポンス形式
export type CalendarDetailApiResponse = {
  id: string;
  name: string;
  color: string;
  imageUrl?: string;
  member?: Array<{
    userId: string;
    name: string;
    joinedAt: string;
  }>;
  option?: Array<{
    id: number;
    name: string;
    deprecated: boolean;
  }>;
};

export type CalendarDetail = CalendarQueryResponse;

export type ScheduleApiResponse = {
  date: string;
  items: ScheduleItem[];
};

// フロントエンド用に変換後のレスポンス形式
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
