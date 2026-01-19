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
