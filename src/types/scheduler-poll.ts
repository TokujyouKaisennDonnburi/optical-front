export interface SchedulerCreateRequest {
    title: string;
    memo: string;
    limitTime: string | null;
    isAllDay: boolean;
    dates: SchedulerCreateDateRequest[];
}

export interface SchedulerCreateDateRequest {
    date: string;
    startTime: string;
    endTime: string;
}

export interface SchedulerCreateResponse {
    schedulerId: string;
}

export interface AddAttendanceRequest {
    comment: string;
    status: AttendanceStatus[];
}

export interface AttendanceStatus {
    date: string;
    status: number;
}

export interface SchedulerResponse {
    id: string;
    calendar_id: string;
    user_id: string;
    title: string;
    memo: string;
    limitTime: string;
    is_allday: boolean;
    is_done: boolean;
}

export interface DateInfo {
    date: string;
    startTime: string;
    endTime: string;
}

export interface Submission {
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    availabilities: { [date: string]: number };
    comment: string;
}

export interface SchedulerDetailResponse {
    id: string;
    title: string;
    memo: string;
    dates: DateInfo[];
    submissions: Submission[];
}

// Scheduler Poll types for list and detail views
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

export interface SchedulerPollDetailResponse {
    id: string;
    title: string;
    memo: string;
    dates: DateInfo[];
    submissions: SchedulerPollSubmission[];
}

export interface SchedulerPollSubmission {
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    availabilities: { [date: string]: "ok" | "maybe" | "ng" };
    comment: string;
}

export interface SchedulerPollCreateRequest {
    title: string;
    memo: string;
    limitTime: string | null;
    isAllDay: boolean;
    dates: SchedulerCreateDateRequest[];
    availabilities: { [date: string]: "ok" | "maybe" | "ng" };
    comment: string;
}

export interface SchedulerAddAttendanceRequest {
    availability: { [date: string]: "ok" | "maybe" | "ng" };
    comment: string;
}
