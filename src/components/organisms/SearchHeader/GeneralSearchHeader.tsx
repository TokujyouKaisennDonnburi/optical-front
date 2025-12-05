import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { BadgeButton } from "@/components/molecules/BadgeButton";
import { MultiSelectDropdown } from "@/components/molecules/MultiSelectDropdown/MultiSelectDropdown";
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput";

type LabeledOption = { label: string; value: string };

type GeneralSearchHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  calendarOptions?: Array<string | LabeledOption>;
  selectedCalendars?: string[];
  onCalendarChange?: (value: string[]) => void;
  yearOptions?: number[];
};

/**
 * 総合スケジュールページ用の検索ヘッダー
 * カレンダーフィルター、期間フィルターを含む
 */
export function GeneralSearchHeader({
  searchValue,
  onSearchChange,
  calendarOptions,
  selectedCalendars,
  onCalendarChange,
  yearOptions,
}: GeneralSearchHeaderProps) {
  const [search, setSearch] = useState(searchValue ?? ""); // 検索バーの入力値
  const [calendar, setCalendar] = useState<string[]>(selectedCalendars ?? []); // カレンダーフィルターの選択値
  const [period, setPeriod] = useState<string[]>([]); // 期間フィルターの選択値

  useEffect(() => {
    setSearch(searchValue ?? "");
  }, [searchValue]);

  useEffect(() => {
    setCalendar(selectedCalendars ?? []);
  }, [selectedCalendars]);

  const availableCalendars = useMemo(() => {
    return calendarOptions ?? [];
  }, [calendarOptions]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleCalendarChange = (value: string[]) => {
    setCalendar(value);
    onCalendarChange?.(value);
  };

  // クリアボタンの処理
  const handleClear = () => {
    handleSearchChange("");
    handleCalendarChange([]);
    setPeriod([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {/* 検索バー */}
        <div className="w-[500px]">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            onSelect={handleSearchChange}
            placeholder="スケジュール、参加者、場所を検索..."
          />
        </div>

        {/* カレンダーフィルター */}
        <div className="w-[190px]">
          <MultiSelectDropdown
            options={availableCalendars}
            placeholder="カレンダーの指定"
            value={calendar}
            onChange={handleCalendarChange}
          />
        </div>

        {/* 期間フィルター */}
        <div className="w-[120px]">
          <MultiSelectDropdown
            options={(yearOptions ?? []).map((y) => y.toString())}
            placeholder="年数の指定"
            value={period}
            onChange={setPeriod}
          />
        </div>

        <div className="ml-auto flex gap-15">
          {/* クリアボタン */}
          <Button variant="outline" onClick={handleClear}>
            クリア
          </Button>

          {/* OptiCal ロゴ */}
          <div className="flex items-center">
            <Image src="/optical.png" alt="OptiCal" width={24} height={24} />
          </div>

          {/* 通知バッチ */}
          <BadgeButton
            count={3}
            label="通知"
            onClick={() => alert("通知クリック")}
          />
        </div>
      </div>
    </div>
  );
}
