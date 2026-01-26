import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type {
  CreateScheduleRequest,
  CreateScheduleResponse,
  ScheduleApiResponse,
} from "@/types/schedule";

export async function getTodaySchedule() {
  return apiGet<ScheduleApiResponse>("/events/todays");
}

export async function getMonthSchedule(month?: string) {
  return apiGet<ScheduleApiResponse>(`/events/months?month=${month || ""}`);
}

export async function createSchedule(
  calendarId: string,
  body: CreateScheduleRequest,
) {
  return apiPost<CreateScheduleResponse>(
    `/calendars/${calendarId}/events`,
    body,
  );
}

/**
 * スケジュール削除API
 * 本番環境: DELETE /api/calendars/{calendarId}/events/{eventId}
 *
 * @param calendarId - カレンダーID
 * @param eventId - イベント/スケジュールID
 * @returns 削除結果
 *
 * 実装例（親コンポーネント）:
 * try {
 *   await deleteSchedule(calendarId, eventId);
 *   toast.success('予定を削除しました');
 *   onRefresh(); // データ再取得
 * } catch (error) {
 *   toast.error('削除に失敗しました');
 * }
 */
export async function deleteSchedule(calendarId: string, eventId: string) {
  return apiDelete(`/calendars/${calendarId}/events/${eventId}`);
}

export async function updateSchedule(
  calendarId: string,
  eventId: string,
  updates: {
    title?: string;
    memo?: string;
    location?: string;
    startTime?: string;
    endTime?: string;
    isAllDay?: boolean;
  },
) {
  return apiPatch(`/calendars/${calendarId}/events/${eventId}`, updates);
}
