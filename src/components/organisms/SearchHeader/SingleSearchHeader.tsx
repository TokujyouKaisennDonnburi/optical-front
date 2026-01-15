import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";

import { BadgeButton } from "@/components/molecules/BadgeButton";
import { DateSelector } from "@/components/molecules/DateSelector/DateSelector";
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput";

type SingleSearchHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onYearMonthChange?: (period: { year?: number; month?: number }) => void;
  onDateChange?: (date: Date | undefined) => void;
  date?: Date;
  onClear?: () => void;
};

/**
 * 単体スケジュールページ用の検索ヘッダー
 * OptiCal ボタンを含む（クリックでダイアログを開く）
 */
export function SingleSearchHeader({
  searchValue,
  onSearchChange,
  onYearMonthChange,
  onDateChange,
  date,
  onClear,
}: SingleSearchHeaderProps) {
  const [search, setSearch] = useState(searchValue ?? ""); // 検索バーの入力値

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  // 期間フィルターの入力値を同期
  const handleDateChange = (value: Date | undefined) => {
    onDateChange?.(value);
  };

  const handleClear = () => {
    handleSearchChange("");
    onDateChange?.(undefined);
    onYearMonthChange?.({ year: undefined, month: undefined });
    onClear?.();
  };

  return (
    <div className="flex gap-3 items-center flex-1">
      {/* 検索バー */}
      <div className="w-[25rem]">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          onSelect={handleSearchChange}
          placeholder="タイトル、場所、メモを検索..."
        />
      </div>

      {/* 期間フィルター */}
      <div className="w-[8.75rem]">
        <DateSelector
          placeholder="年月の指定"
          value={date}
          onChange={handleDateChange}
        />
      </div>

      {/* リセットボタン */}
      <Button variant="outline" onClick={handleClear}>
        <RefreshCw className="w-4 h-4 mr-1" />
        リセット
      </Button>

      <div className="ml-auto flex gap-2 items-center">
        {/* 通知バッチ */}
        <BadgeButton
          count={0}
          label="通知"
          onClick={() => alert("通知クリック")}
        />
      </div>
    </div>
  );
}
