export interface SchedulerPollCreateRequest {
  title: string;
  memo: string;
  limitTime: string | null;
  isAllDay: boolean;
  dates: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  availabilities: {
    [date: string]: "ok" | "maybe" | "ng";
  };
  comment?: string;
}

export interface SchedulerPollResponse {
  id: string;
  title: string;
  memo: string;
  limitTime: string | null;
  author: string;
  createdAt: string;
  respondersCount: number;
  hasResponded: boolean;
}

export interface DateInfo {
  date: string;
  startTime: string;
  endTime: string;
}

export interface PollSubmission {
  user: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  availabilities: { [date: string]: "ok" | "maybe" | "ng" };
  comment: string;
}

export interface SchedulerPollDetailResponse {
  id: string;
  title: string;
  memo: string;
  dates: DateInfo[];
  submissions: PollSubmission[];
}
