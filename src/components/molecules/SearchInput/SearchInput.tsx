import React, { useState, useRef } from "react";
import { Input } from "@/components/atoms/Input";
import { ScrollArea } from "@/components/atoms/ScrollArea";

// 検索結果の1行を表すリストアイテム
const ListItem: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <li
    style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}
    onClick={onClick}
  >
    {children}
  </li>
);

// 検索結果リスト
const SearchResultList: React.FC<{ items: string[]; onItemClick: (value: string) => void }> = ({ items, onItemClick }) => (
  <div
    style={{
      position: "absolute",
      top: "40px",
      left: 0,
      width: "100%",
      zIndex: 1000,
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      borderRadius: 4,
      border: "1px solid #ccc"
    }}
  >
    <ScrollArea style={{ maxHeight: 150 }}>
      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {items.map((item, idx) => (
          <ListItem key={idx} onClick={() => onItemClick(item)}>
            {item}
          </ListItem>
        ))}
      </ul>
    </ScrollArea>
  </div>
);

// 検索入力コンポーネントのプロパティ型
interface SearchInputProps {
  suggestions: string[];
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  placeholder?: string;
}

// 検索入力コンポーネント
export function SearchInput({ suggestions, value, onChange, onSelect, placeholder }: SearchInputProps) {
  // 検索候補を表示するかどうかの状態
  const [showList, setShowList] = React.useState(false);
  // 入力フィールドの参照
  const inputRef = useRef<HTMLInputElement>(null);

  // 入力値に基づきフィルタリングした提案を取得
  const filtered = suggestions.filter(
    item => item.toLowerCase().includes(value.toLowerCase()) && item !== value
  );

  // 入力値が変更された時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowList(true);
  };

  // アイテムが選択された時の処理
  const handleSelect = (val: string) => {
    onChange(val);
    setShowList(false);
    onSelect(val);
  };

  // 入力フィールドからフォーカスが外れた時の処理
  const handleBlur = () => {
    setTimeout(() => setShowList(false), 100);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* 検索入力フィールド */}
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setShowList(true)}
        onBlur={handleBlur}
        placeholder={placeholder || "検索..."}
        autoComplete="off"
      />

      {/* 検索結果の候補リスト */}
      {showList && filtered.length > 0 && (
        <SearchResultList items={filtered} onItemClick={handleSelect} />
      )}
    </div>
  );
};

