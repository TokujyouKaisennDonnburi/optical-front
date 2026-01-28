import * as React from "react";
import { UserAvatar } from "@/components/atoms/UserAvatar/UserAvatar";
import { cn } from "@/utils_constants_styles/utils";

// アカウントメニューボタンのプロパティ型
export interface AccountMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  avatarUrl: string | null;
  name?: string;
  userId?: string; // userId is now optional but recommended for consistent colors
  avatarSizeClass?: string;
}

export const AccountMenuButton = React.forwardRef<
  HTMLButtonElement,
  AccountMenuButtonProps
>(({ avatarUrl, name, userId, avatarSizeClass, className, ...props }, ref) => {
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
      <UserAvatar
        userId={userId ?? "unknown"} // Fallback to "unknown" if no ID (though it should be provided)
        name={name}
        avatarUrl={avatarUrl}
        className={cn("w-full h-full", avatarSizeClass)}
        size="md" // Size is controlled/overridden by className driven by avatarSizeClass often, but setting a default
      />
    </button>
  );
});
