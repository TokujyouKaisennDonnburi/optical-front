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
  user: {
    id: string;
    name: string;
    email: string;
    iconUrl?: string;
  } | null;
  isLoading?: boolean;
  error?: Error | null;
  menuWidthClass?: string;
  avatarSizeClass?: string;
}

export function AccountMenu({
  user,
  isLoading,
  error,
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

  // ローディング中のフォールバック処理(現状は仮アイコンの表示)
  if (isLoading) {
    return <AccountMenuButton avatarUrl={"https://i.pravatar.cc/100?img=0"} avatarSizeClass={avatarSizeClass} />;
  }

  // エラー時のフォールバック処理(現状は仮アイコンの表示)
  if (error) {
    return <AccountMenuButton avatarUrl={"https://i.pravatar.cc/100?img=0"} avatarSizeClass={avatarSizeClass} />;
  }
  
  // ユーザー情報がない場合のフォールバック処理(現状は何も表示しない)
  if (!user) {
    return null;
  }

  return (
    // ドロップダウン全体のコンテナ
    <DropdownMenu>
      {/* プロフィール画像(メニューを開くトリガー) */}
      <DropdownMenuTrigger asChild>
        <AccountMenuButton name={user.name} avatarUrl={user.iconUrl} avatarSizeClass={avatarSizeClass} />
      </DropdownMenuTrigger>

      {/* ドロップダウンメニューのコンテンツ */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn("rounded-lg border bg-popover p-0 shadow-md", menuWidthClass)}
      >
        {/* メニューアイテムのリストを表示 */}
        <AccountMenuItems name={user.name} email={user.email} avatarUrl={user.iconUrl} items={menuItems} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
