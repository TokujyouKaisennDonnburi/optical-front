import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/atoms/DropdownMenu";
import { Button } from "@/components/atoms/Button";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface MultiSelectDropdownProps {
  options: string[];
  placeholder?: string;
  value: string[];
  onChange: (selected: string[]) => void;
}

export function MultiSelectDropdown({
  options,
  placeholder,
  value,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(value);

  // value と open が変化したときの同期処理
  useEffect(() => {
    if (!open) {
      setTempSelected(value);
    }
  }, [value, open]);

  // open/close 管理
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // 閉じた時に確定
      onChange(tempSelected);
    }
  };

  // チェックボックスの選択管理
  const handleTempChange = (option: string, checked: boolean) => {
    setTempSelected(prev =>
      checked ? [...prev, option] : prev.filter(o => o !== option)
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between px-3"
        >
          <span className="flex-1 min-w-0 truncate text-left">
            {value.length === 0
              ? placeholder || "選択してください"
              : value.join(", ")}
          </span>
          <ChevronDown
            className={`ml-2 h-4 w-4 shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent sideOffset={4}>
        {[...new Set(options)].map(option => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={tempSelected.includes(option)}
            onCheckedChange={checked => handleTempChange(option, checked)}
            onSelect={e => e.preventDefault()} // チェック後に閉じないように
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
