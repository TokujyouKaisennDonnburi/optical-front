"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { cn } from "@/utils_constants_styles/utils";

// ユーザーIDから一貫した色を生成
const AVATAR_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-indigo-500",
];

function getColorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (
    AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
  );
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0]?.charAt(0).toUpperCase() ?? "?";
  }
  return (
    (parts[0]?.charAt(0).toUpperCase() ?? "") +
    (parts[parts.length - 1]?.charAt(0).toUpperCase() ?? "")
  );
}

export type UserAvatarSize = "sm" | "md" | "lg";

export interface UserAvatarProps {
  userId: string;
  name?: string;
  avatarUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
}

const sizeClasses: Record<UserAvatarSize, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function UserAvatar({
  userId,
  name,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) {
  const colorClass = getColorFromId(userId);
  const initials = getInitials(name ?? userId);

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name ?? "User avatar"} />}
      <AvatarFallback
        className={cn(
          colorClass,
          "text-white font-medium flex items-center justify-center",
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
