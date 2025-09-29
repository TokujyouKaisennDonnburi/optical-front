import * as React from "react";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/atoms/DropdownMenu";

type AccountMenuItemsProps = {
  name: string;
  email: string;
  avatarUrl?: string;
  items: {
    label: string;
    icon: React.ReactNode;
    onSelect: () => void;
  }[];
};

export function AccountMenuItems({ name, email, avatarUrl, items }: AccountMenuItemsProps) {
  return (
    <div className="flex flex-col w-full">
      {/* プロフィール情報 */}
      <div className="flex flex-col items-center p-4 text-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-16 h-16 rounded-full border"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-white text-xl">
            {name.charAt(0)}
          </div>
        )}

        {/* ユーザー名 */}
        <div className="mt-2 text-sm font-medium w-full truncate" title={name}>
          {name}
        </div>
        
        {/* メールアドレス */}
        <div className="text-xs text-gray-500 w-full truncate" title={email}>
          {email}
        </div>
      </div>

      {/* 区切り線 */}
      <hr className="my-2" />

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
          <span className="text-sm">{item.label}</span>
        </DropdownMenuItem>
      ))}
    </div>
  );
}
