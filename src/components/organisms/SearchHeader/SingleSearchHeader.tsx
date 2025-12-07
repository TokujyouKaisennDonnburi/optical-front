import Image from "next/image";
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
  onClear,
  onOptiCalClick,
}: SingleSearchHeaderProps) {
  const [search, setSearch] = useState(searchValue ?? "");
  const [date, setDate] = useState<Date | undefined>(); // 期間フィルターの選択値

  // 期間フィルターの入力値を同期
  const handleDateChange = (date: Date | undefined) => {
    setDate(date);
    onDateChange?.(date);

    if (date) {
      onYearMonthChange?.({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
      });
    } else {
      onYearMonthChange?.({
        year: undefined,
        month: undefined,
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleClear = () => {
    handleSearchChange("");
    setDate(undefined);
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
          value={date}
          onChange={handleDateChange}
          placeholder="年月の指定"
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

      {/* 通知バッチ */}
      <BadgeButton
        count={0}
        label="通知"
        onClick={() => alert("通知クリック")}
      />
    </div>
  );
}
