import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/atoms/DropdownMenu";
import { Button } from "@/components/atoms/Button";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { useMemo, useState } from "react";
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
  const uniqueOptions = useMemo(() => Array.from(new Set(options)), [options]);

  const MAX_VISIBLE_OPTIONS = 3;
  const ITEM_HEIGHT_PX = 40;
  const shouldScroll = uniqueOptions.length > MAX_VISIBLE_OPTIONS;
  const scrollAreaMaxHeight = shouldScroll
    ? MAX_VISIBLE_OPTIONS * ITEM_HEIGHT_PX
    : undefined;

  // open/close 管理
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  // チェックボックスの選択管理
  const handleTempChange = (option: string, checked: CheckedState) => {
    const isChecked = checked === true;
    const current = new Set(value);
    if (isChecked) {
      current.add(option);
    } else {
      current.delete(option);
    }
    onChange(Array.from(current));
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

      <DropdownMenuContent sideOffset={4} className="p-0">
        <ScrollArea
          className="w-full"
          style={
            scrollAreaMaxHeight
              ? { maxHeight: `${scrollAreaMaxHeight}px` }
              : undefined
          }
        >
          <div className="py-1">
            {uniqueOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={value.includes(option)}
                onCheckedChange={(checked) => handleTempChange(option, checked)}
                onSelect={(e) => e.preventDefault()} // チェック後に閉じないように
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
