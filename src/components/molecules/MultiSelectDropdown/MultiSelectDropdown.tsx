import type { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import { ScrollArea } from "@/components/atoms/ScrollArea";

type Option = string | { label: string; value: string };

interface MultiSelectDropdownProps {
  options: Option[];
  placeholder?: string;
  value: string[]; // store option.value
  onChange: (selected: string[]) => void;
}

export function MultiSelectDropdown({
  options,
  placeholder,
  value,
  onChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const normalized = useMemo(() => {
    const arr = options.map((o) =>
      typeof o === "string" ? { label: o, value: o } : o,
    );
    // de-duplicate by value while keeping first label
    const map = new Map<string, { label: string; value: string }>();
    for (const opt of arr) {
      if (!map.has(opt.value)) map.set(opt.value, opt);
    }
    return Array.from(map.values());
  }, [options]);

  const labelByValue = useMemo(() => {
    const m = new Map<string, string>();
    for (const opt of normalized) m.set(opt.value, opt.label);
    return m;
  }, [normalized]);

  const MAX_VISIBLE_OPTIONS = 3;
  const ITEM_HEIGHT_PX = 40;
  const shouldScroll = normalized.length > MAX_VISIBLE_OPTIONS;
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
              : value
                  .map((v) => labelByValue.get(v) ?? v)
                  .filter(Boolean)
                  .join(", ")}
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
            {normalized.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={value.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleTempChange(option.value, checked)
                }
                onSelect={(e) => e.preventDefault()} // チェック後に閉じないように
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
