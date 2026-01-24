import { LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import { AccountMenuButton } from "@/components/molecules/AccountMenuButton/AccountMenuButton";
import { AccountMenuItems } from "@/components/molecules/AccountMenuItems/AccountMenuItems";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils_constants_styles/utils";

// アカウントメニューのプロパティ型
export interface AccountMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  isLoading?: boolean;
  error?: Error | null;
  menuWidthClass?: string;
  avatarSizeClass?: string;
  onRequestEmailSave: (newEmail: string) => void; // 親に渡す
  confirmSaveTrigger?: number; // 保存要求をトリガーするための数値
}

export function AccountMenu({
  user,
  isLoading,
  error,
  menuWidthClass = "w-64",
  avatarSizeClass = "h-10 w-10",
  onRequestEmailSave,
  confirmSaveTrigger,
}: AccountMenuProps & { onRequestEmailSave: (newEmail: string) => void }) {
  const { logout } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || null);

  /**
   * ログアウト処理を実行
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // メニューアイテムの定義 (必要に応じて追加可能)
  const menuItems = [
    {
      label: "ログアウト",
      icon: <LogOut className="h-4 w-4" />,
      onSelect: handleLogout,
    },
  ];

  // ローディング中のフォールバック処理 (現状は仮アイコンの表示)
  if (isLoading) {
    return (
      <AccountMenuButton
        avatarUrl={"https://i.pravatar.cc/100?img=0"}
        avatarSizeClass={avatarSizeClass}
      />
    );
  }

  // エラー時のフォールバック処理 (現状は仮アイコンの表示)
  if (error) {
    return (
      <AccountMenuButton
        avatarUrl={"https://i.pravatar.cc/100?img=0"}
        avatarSizeClass={avatarSizeClass}
      />
    );
  }

  // ユーザー情報がない場合のフォールバック処理 (現状は何も表示しない)
  if (!user) {
    return null;
  }

  return (
    // ドロップダウン全体のコンテナ
    <DropdownMenu>
      {/* プロフィール画像 (メニューを開くトリガー) */}
      <DropdownMenuTrigger asChild>
        <AccountMenuButton
          name={user.name}
          avatarUrl={avatarUrl}
          avatarSizeClass={avatarSizeClass}
        />
      </DropdownMenuTrigger>

      {/* ドロップダウンメニューのコンテンツ */}
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className={cn(
            "z-[9999] rounded-lg border bg-popover p-0 shadow-md",
            menuWidthClass,
          )}
        >
          {/* メニューアイテムのリストを表示 */}
          <AccountMenuItems
            name={user.name}
            email={user.email}
            avatarUrl={avatarUrl}
            items={menuItems}
            setAvatarUrl={setAvatarUrl}
            onRequestEmailSave={onRequestEmailSave} // 親に渡す
            confirmSaveTrigger={confirmSaveTrigger}
          />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
