import { Badge } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { BadgeButton } from "@/components/molecules/BadgeButton";
import { SearchInput } from "@/components/molecules/SearchInput/SearchInput";

type SingleSearchHeaderProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
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
  onClear,
  onOptiCalClick,
}: SingleSearchHeaderProps) {
  const [search, setSearch] = useState(searchValue ?? "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearchChange?.(value);
  };

  const handleClear = () => {
    handleSearchChange("");
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
