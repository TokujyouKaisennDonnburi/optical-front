import type { CheckedState } from "@radix-ui/react-checkbox";
import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";

type Option = string | { label: string; value: string; color?: string };

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
      typeof o === "string" ? { label: o, value: o, color: undefined } : o,
    );
    // de-duplicate by value while keeping first label
    const map = new Map<
      string,
      { label: string; value: string; color?: string }
    >();
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

  // ★ 3行分の高さ
  const MAX_VISIBLE_OPTIONS = 3;
  const ITEM_HEIGHT_PX = 40;
  const scrollAreaMaxHeight = MAX_VISIBLE_OPTIONS * ITEM_HEIGHT_PX;

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
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full flex items-center justify-between px-3"
          disabled={normalized.length === 0}
        >
          <span className="flex-1 truncate text-left">
            {value.length === 0
              ? placeholder || "選択してください"
              : value.map((v) => labelByValue.get(v) || v).join(", ")}
          </span>

          <ChevronDown
            className={`ml-2 h-4 w-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </DropdownMenuTrigger>

      {/** optionsが0個のときは完全に反応しなくなる */}
      {normalized.length > 0 && (
        <DropdownMenuPortal>
          <DropdownMenuContent sideOffset={4} className="p-0">
            <div
              className="overflow-y-auto"
              style={{ maxHeight: scrollAreaMaxHeight }}
            >
              {normalized.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={value.includes(option.value)}
                  onCheckedChange={(checked) =>
                    handleTempChange(option.value, checked)
                  }
                  onSelect={(e) => e.preventDefault()} // チェックで閉じない
                  className="flex items-center gap-2"
                >
                  {option.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: option.color }}
                    />
                  )}
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      )}
    </DropdownMenu>
  );
}
