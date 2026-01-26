/**
 * イベント時刻・日付のユーティリティ関数
 */

/**
 * 時刻を5分単位に切り上げ
 * （終日→通常切替時の初期値に利用）
 */
export function roundUpTo5Minutes(date: Date) {
  const d = new Date(date);
  const m = d.getMinutes();
  const rounded = Math.ceil(m / 5) * 5;
  d.setMinutes(rounded, 0, 0);
  return d;
}

/**
 * Date型を時刻文字列（HH:mm）にフォーマット
 */
export function formatTimeHM(date: Date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * 日付と時刻文字列を結合してDate型を生成
 * 形式が不正な場合は元の日付を返す
 */
export function combineDateAndTime(date: Date, timeStr: string): Date {
  if (!timeStr) {
    return new Date(date);
  }
  const parts = timeStr.split(":");
  if (parts.length !== 2) {
    return new Date(date);
  }
  const [hStr, mStr] = parts;
  const h = Number(hStr);
  const m = Number(mStr);
  if (
    !Number.isFinite(h) ||
    !Number.isFinite(m) ||
    h < 0 ||
    h > 23 ||
    m < 0 ||
    m > 59
  ) {
    return new Date(date);
  }
  const result = new Date(date);
  result.setHours(h, m, 0, 0);
  return result;
}

/**
 * 日付文字列（YYYY-MM-DD）をDate型に変換
 * 形式が不正な場合は Invalid Date を返す
 */
export function parseDateInput(value: string): Date {
  const parts = value.split("-");
  if (parts.length !== 3) {
    return new Date(NaN);
  }
  const [yStr, mStr, dStr] = parts;
  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) {
    return new Date(NaN);
  }
  if (m < 1 || m > 12 || d < 1 || d > 31) {
    return new Date(NaN);
  }
  return new Date(y, m - 1, d);
}
