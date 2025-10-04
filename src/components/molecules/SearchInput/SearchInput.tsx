import type { ChangeEvent } from "react";

import { Input } from "@/components/atoms/Input";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
}

// シンプルな検索入力コンポーネント
export function SearchInput({
  value,
  onChange,
  onSelect,
  placeholder,
}: SearchInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    onChange(nextValue);
    onSelect?.(nextValue);
  };

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder || "検索..."}
      autoComplete="off"
    />
  );
}
