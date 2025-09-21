import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/atoms/DropdownMenu";
import { Button } from "@/components/atoms/Button";
import { useState, useEffect } from "react";

// MultiSelectDropdownのProps型定義
interface MultiSelectDropdownProps {
  options: string[];    // 選択肢のリスト
  placeholder?: string; // プレースホルダー
  value: string[];      // 現在選択されている値のリスト
  onChange: (selected: string[]) => void; // 選択された値が変更された際のコールバック関数
}

export default function MultiSelectDropdown({
  options,
  placeholder,
  value,
  onChange,
}: MultiSelectDropdownProps) {
  // ドロップダウンの開閉状態を管理するステート
  const [open, setOpen] = useState(false);

  // 一時的に選択された値を管理するステート
  const [tempSelected, setTempSelected] = useState<string[]>(value);

  // valueやopenが変更された際に一時的な選択値を更新
  useEffect(() => {
    if (!open) setTempSelected(value);
  }, [value, open]);

  // 一時的な選択変更をハンドルする関数
  const handleTempChange = (option: string, checked: boolean) => {
    setTempSelected(prev =>
      checked ? [...prev, option] : prev.filter(o => o !== option)
    );
  };

  // ドロップダウンの開閉時に選択を管理する関数
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      onChange(tempSelected); // ドロップダウンが閉じた時、選択された値を親に渡す
    } else {
      setTempSelected(value); // 開いた時は初期の選択状態に戻す
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      {/* ドロップダウンをトリガーするボタン */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between overflow-hidden whitespace-nowrap text-ellipsis px-3"
          style={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            maxWidth: "100%",
            textAlign: "left",
          }}
        >
          {/* 左側：テキスト（省略表示） */}
          <span className="flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis text-left">
            {value.length === 0
              ? placeholder || "選択してください"
              : value.join(", ")}
          </span>
          {/* 右側：「アイコン」 */}
          <span className="ml-2 shrink-0">∨</span>
        </Button>
      </DropdownMenuTrigger>

      {/* ドロップダウンの内容（選択肢） */}
      <DropdownMenuContent>
        {options.map(option => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={tempSelected.includes(option)}
            onCheckedChange={checked => handleTempChange(option, checked)}
            onSelect={e => e.preventDefault()} // デフォルト動作を防止
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
