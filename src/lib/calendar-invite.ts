/**
 * カレンダー招待情報のCookie管理
 * 未ログイン時に招待リンクを開いた場合、ログイン後に参加できるよう情報を保存する
 */

const COOKIE_NAME = "pending_calendar_invite";
const COOKIE_MAX_AGE = 60 * 30; // 30分

export type PendingCalendarInvite = {
  calendarId: string;
  token: string;
};

/**
 * 招待情報をCookieに保存
 */
export function savePendingInvite(calendarId: string, token: string): void {
  const value = JSON.stringify({ calendarId, token });
  const isSecure = window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";

  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store APIはSafari未サポートのため使用しない
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; SameSite=Strict; Path=/; Max-Age=${COOKIE_MAX_AGE}${secureFlag}`;
}

/**
 * 招待情報をCookieから取得
 */
export function getPendingInvite(): PendingCalendarInvite | null {
  const cookies = document.cookie.split("; ");
  const cookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) {
    return null;
  }

  try {
    const value = decodeURIComponent(cookie.split("=")[1]);
    const parsed = JSON.parse(value) as PendingCalendarInvite;

    if (parsed.calendarId && parsed.token) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 招待情報をCookieから削除
 */
export function clearPendingInvite(): void {
  // biome-ignore lint/suspicious/noDocumentCookie: Cookie Store APIはSafari未サポートのため使用しない
  document.cookie = `${COOKIE_NAME}=; SameSite=Strict; Path=/; Max-Age=0`;
}
