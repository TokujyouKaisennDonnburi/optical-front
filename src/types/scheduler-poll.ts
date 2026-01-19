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
    id: string;
}

export interface SchedulerAddAttendanceRequest {
    comment: string;
    status: SchedulerStatusRequest;
}

export interface SchedulerStatusRequest {
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
