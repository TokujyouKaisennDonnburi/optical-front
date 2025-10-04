import { SearchInput } from "@/components/molecules/SearchInput/SearchInput";
import { MultiSelectDropdown } from "@/components/molecules/MultiSelectDropdown/MultiSelectDropdown";
import { Button } from "@/components/atoms/Button";
import { useEffect, useMemo, useState } from "react";

// 検索候補・フィルターのリスト(仮)
const fallbackFilterData = [
  {
    title: "会議室A",
    calendar: "仕事用",
    year: 2023,
    month: 4,
  },
  {
    title: "会議室B",
    calendar: "仕事用",
    year: 2024,
    month: 7,
  },
  {
    title: "山田太郎の誕生日",
    calendar: "学校",
    year: 2025,
    month: 1,
  },
  {
    title: "佐藤花子とランチ",
    calendar: "仕事用",
    year: 2023,
    month: 9,
  },
  {
    title: "始業式",
    calendar: "学校",
    year: 2024,
    month: 12,
  },
  {
    title: "沖縄旅行",
    calendar: "私用",
    year: 2025,
    month: 5,
  },
  {
    title: "金沢出張",
    calendar: "仕事用",
    year: 2023,
    month: 11,
  },
];

type SearchHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  calendarOptions?: string[];
  selectedCalendars?: string[];
  onCalendarChange?: (value: string[]) => void;
  periodOptions?: string[];
};

export function SearchHeader({
  searchValue,
  onSearchChange,
  calendarOptions,
  selectedCalendars,
  onCalendarChange,
  periodOptions,
}: SearchHeaderProps) {
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
    if (calendarOptions && calendarOptions.length > 0) {
      return Array.from(new Set(calendarOptions));
    }
    return Array.from(new Set(fallbackFilterData.map((item) => item.calendar)));
  }, [calendarOptions]);

  const availablePeriods = useMemo(() => {
    if (periodOptions && periodOptions.length > 0) {
      return Array.from(new Set(periodOptions));
    }
    return Array.from(
      new Set(fallbackFilterData.map((item) => item.year.toString())),
    );
  }, [periodOptions]);

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
        <div className="w-[600px]">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            onSelect={handleSearchChange}
            placeholder="スケジュール、参加者、場所を検索..."
          />
        </div>

        {/* カレンダーフィルター */}
        <div className="w-[180px]">
          <MultiSelectDropdown
            options={availableCalendars}
            placeholder="全てのカレンダー"
            value={calendar}
            onChange={handleCalendarChange}
          />
        </div>

        {/* 期間フィルター */}
        <div className="w-[100px]">
          <MultiSelectDropdown
            options={availablePeriods}
            placeholder="全期間"
            value={period}
            onChange={setPeriod}
          />
        </div>

        {/* クリアボタン */}
        <Button variant="outline" onClick={handleClear}>
          クリア
        </Button>
      </div>
    </div>
  );
}
