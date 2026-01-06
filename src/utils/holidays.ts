import JapaneseHolidays from "japanese-holidays";

/**
 * 指定された日付の祝日名を取得する
 * 祝日でない場合は undefined を返す
 */
export function getHolidayName(date: Date): string | undefined {
  const holiday = JapaneseHolidays.isHoliday(date);
  return typeof holiday === "string" ? holiday : undefined;
}
