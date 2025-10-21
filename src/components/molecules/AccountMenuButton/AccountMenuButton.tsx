import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import { cn } from "@/utils_constants_styles/utils";

// アカウントメニューボタンのプロパティ型
export interface AccountMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  avatarUrl?: string;
  name?: string;
  avatarSizeClass?: string;
}

export const AccountMenuButton = React.forwardRef<
  HTMLButtonElement,
  AccountMenuButtonProps
>(({ avatarUrl, name, avatarSizeClass, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={`Open account menu for ${name ?? "user"}`}
      className={cn(
        "inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        avatarSizeClass,
        className,
      )}
      {...props} // ← Radix が必要とする props を受け取れるようにする
    >
      <Avatar className={avatarSizeClass}>
        {avatarUrl ? (
          // アバター画像がある場合は表示
          <AvatarImage src={avatarUrl} alt={name ?? "user"} />
        ) : (
          // 画像がない場合はイニシャルを表示
          <AvatarFallback>{(name || "U").slice(0, 1)}</AvatarFallback>
        )}
      </Avatar>
    </button>
  );
});
