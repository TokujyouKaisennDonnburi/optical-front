import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateSelector } from "@/components/molecules/DateSelector/DateSelector";
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput";

type SingleSearchHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onYearMonthChange?: (period: { year?: number; month?: number }) => void;
  onDateChange?: (date: Date | undefined) => void;
  date?: Date;
  onClear?: () => void;
  onOptiCalClick?: () => void;
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
  onOptiCalClick,
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
    <div className="flex gap-2 items-center flex-1">
      {/* 検索バー */}
      <div className="w-[400px]">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          onSelect={handleSearchChange}
          placeholder="スケジュール、参加者、場所を検索..."
        />
      </div>

      {/* 期間フィルター */}
      <div className="w-[140px]">
        <DateSelector
          placeholder="年月の指定"
          value={date}
          onChange={handleDateChange}
        />
      </div>

      {/* クリアボタン */}
      <Button variant="outline" onClick={handleClear}>
        クリア
      </Button>

      {/* OptiCalボタン */}
      <div className="ml-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={onOptiCalClick}
          aria-label="OptiCalを表示"
        >
          <Image src="/optical.png" alt="OptiCal" width={24} height={24} />
        </Button>
      </div>
    </div>
  );
}
