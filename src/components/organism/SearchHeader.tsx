import SearchInput from "@/components/molecules/SearchInput";
import MultiSelectDropdown from "@/components/molecules/SearchCalendar";
import { Button } from "@/components/atoms/Button";
import { useState } from "react";

// 検索候補・フィルターのリスト(仮)
const suggestions = [
  "会議室A", "会議室B", "山田太郎", "佐藤花子", "学校", "沖縄旅行", "金沢出張"
];
const calendarOptions = ["仕事用", "私用", "学校", "沖縄旅行", "金沢出張"];
const periodOptions = ["全期間", "今週", "今月"];

export default function SearchHeader() {
  const [search, setSearch] = useState("");   // 検索バーの入力値
  const [calendar, setCalendar] = useState<string[]>([]); // カレンダーフィルターの選択値
  const [period, setPeriod] = useState<string[]>([]); // 期間フィルターの選択値
  
  // クリアボタンの処理
  const handleClear = () => {
    setSearch("");
    setCalendar([]);
    setPeriod([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        {/* 検索バー */}
        <div className="w-[600px]">
          <SearchInput
            suggestions={suggestions}
            value={search}
            onChange={setSearch}
            onSelect={setSearch}
            placeholder="スケジュール、参加者、場所を検索..."
          />
        </div>
        
        {/* カレンダーフィルター */}
        <div className="w-[140px]">
        <MultiSelectDropdown
          options={calendarOptions}
          placeholder="全てのカレンダー"
          value={calendar}
          onChange={setCalendar}
        />
        </div>

        {/* 期間フィルター */}
        <div className="w-[90px]">
        <MultiSelectDropdown
          options={periodOptions}
          placeholder="全期間"
          value={period}
          onChange={setPeriod}
        /></div>

        {/* クリアボタン */}
        <Button variant="outline" onClick={handleClear}>
          クリア
        </Button>
      </div>
    </div>
  );
}
