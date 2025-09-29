import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/atoms/DropdownMenu";
import { cn } from "@/utils_constants_styles/utils";
import { AccountMenuItems } from "@/components/molecules/AccountMenuItems/AccountMenuItems";
import { AccountMenuButton } from "@/components/molecules/AccountMenuButton/AccountMenuButton";
import { LogOut } from "lucide-react";

// アカウントメニューのプロパティ型
export interface AccountMenuProps {
  name: string;
  email: string;  // ← 追加
  avatarUrl?: string;
  menuWidthClass?: string;
  avatarSizeClass?: string;
}

export function AccountMenu({
  name,
  email,
  avatarUrl,
  menuWidthClass = "w-52",
  avatarSizeClass = "h-10 w-10",
}: AccountMenuProps) {
  // メニューアイテムの定義（必要に応じて追加可能）
  const menuItems = [
    {
      label: "ログアウト",
      icon: <LogOut className="h-4 w-4" />,
      onSelect: () => console.log("ログアウト"),  // 選択時の処理(現在はコンソールログにて仮の動作を実装)
    },
  ];

  return (
    // ドロップダウン全体のコンテナ
    <DropdownMenu>
      {/* プロフィール画像(メニューを開くトリガー) */}
      <DropdownMenuTrigger asChild>
        <AccountMenuButton name={name} avatarUrl={avatarUrl} avatarSizeClass={avatarSizeClass} />
      </DropdownMenuTrigger>

      {/* ドロップダウンメニューのコンテンツ */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn("rounded-lg border bg-popover p-0 shadow-md", menuWidthClass)}
      >
        {/* メニューアイテムのリストを表示 */}
        <AccountMenuItems name={name} email={email} avatarUrl={avatarUrl} items={menuItems} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
