import * as React from "react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/atoms/DropdownMenu";

// 単一メニューアイテムの型
export interface AccountMenuItem {
  label: string;                   // メニュー名
  icon?: React.ReactNode;           // アイコン（任意）
  onSelect?: () => void;           // 選択時の処理（任意）
}

// メニュー全体の型
export interface AccountMenuItemsProps {
  name: string;                     // ユーザー名
  items: AccountMenuItem[];         // メニューアイテム配列
}

export function AccountMenuItems({ name, items }: AccountMenuItemsProps) {
  return (
    <div>
      {/* ユーザー名表示 */}
      <DropdownMenuLabel className="text-center">{name}</DropdownMenuLabel>
      <DropdownMenuSeparator />

      {/* メニューアイテムを動的に展開 */}
      {items.map((item, index) => (
        <DropdownMenuItem
          key={index}
          onSelect={(e) => {
            e.preventDefault();      // デフォルト挙動をキャンセル
            item.onSelect?.();       // 選択時の処理を呼び出す
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm"
        >
          {item.icon}
          <span>{item.label}</span>
        </DropdownMenuItem>
      ))}
    </div>
  );
}
