/** APIレスポンス用のスケジュールアイテム型 */
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

/** UI表示用のスケジュールボードアイテム型（GeneralCalendarBoard/SingleCalendarBoard共通） */
export type ScheduleBoardItem = {
  id: string;
  title: string;
  start: string; // ISO datetime string
  end?: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarName?: string;
  calendarColor?: string;
  calendarId?: string; // 削除用
  isAllDay?: boolean;
};

/** カレンダー一覧取得APIのレスポンス型 */
export type CalendarQueryResponse = {
  id: string;
  name: string;
  color: string;
  imageUrl?: string;
  options?: string[];
  members?: Array<{
    userId: string;
    name: string;
    joinedAt?: string;
    avatarUrl?: string; // Add if available or derive from userId if needed
  }>;
};

/** バックエンドのカレンダー詳細APIレスポンス形式 */
export type CalendarDetailApiResponse = {
  id: string;
  name: string;
  color: string;
  imageUrl?: string;
  member?: Array<{
    userId: string;
    name: string;
    joinedAt: string;
    avatarUrl?: string;
  }>;
  option?: Array<{
    id: number;
    name: string;
    deprecated: boolean;
  }>;
};

/** カレンダー詳細情報（CalendarQueryResponseのエイリアス） */
export type CalendarDetail = CalendarQueryResponse;

/** スケジュール一覧取得APIのレスポンス型 */
export type ScheduleApiResponse = {
  date: string;
  items: ScheduleItem[];
};

/** フロントエンド用に変換後のカレンダー詳細レスポンス */
export type CalendarDetailResponse = {
  calendar: CalendarDetail;
};

/** 画像アップロードAPIのレスポンス型 */
export type ImageUploadResponse = {
  id: string;
  url: string;
};

/** スケジュール作成APIのリクエスト型 */
export type CreateScheduleRequest = {
  title: string;
  startTime: string; // ISO string (timed event) or day start (all-day)
  endTime: string; // ISO string (timed event) or day end (all-day)
  memo: string;
  location: string;
  isAllDay: boolean;
};

/** スケジュール作成APIのレスポンス型 */
export type CreateScheduleResponse = {
  id: string;
};

/** カレンダー一覧APIのレスポンス型 */
export type CalendarListResponse = CalendarQueryResponse[];

/** カレンダー作成APIのリクエスト型 */
export type CreateCalendarRequest = {
  name: string;
  color: string;
  members: string[];
  optionIds: number[];
  imageId: string | null;
};

/** カレンダー作成APIのレスポンス型 */
export type CreateCalendarResponse = {
  id: string;
  name: string;
};

/** カレンダーグリッドのセル情報（GeneralCalendarBoard/SingleCalendarBoard共通） */
export type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekday: number; // 0 = Sunday, 6 = Saturday
  holidayName?: string;
};

/** カレンダーイベント表示用の型（GeneralCalendarBoard/SingleCalendarBoard共通） */
export type CalendarEvent = {
  id: string;
  title: string;
  memo?: string;
  location?: string;
  locationUrl?: string;
  members?: string[];
  calendarName?: string;
  calendarColor?: string;
  startLabel?: string;
  endLabel?: string;
  date: Date;
  item: ScheduleBoardItem;
  sortKey: number;
};
