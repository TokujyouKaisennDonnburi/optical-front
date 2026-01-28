import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icon";
import { UserAvatar } from "@/components/atoms/UserAvatar/UserAvatar";
import { MemberInviteDialog } from "@/components/molecules/MemberInviteDialog/MemberInviteDialog";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarBoardHeaderProps = {
  badgeLabel: string;
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  badgeIcon?: LucideIcon;
  className?: string;
  members?: Array<{
    userId: string;
    name: string;
    avatarUrl?: string;
  }>;
  calendarId?: string;
  onMemberInvited?: () => void;
};

export function CalendarBoardHeader({
  badgeLabel,
  monthLabel,
  onPrev,
  onNext,
  onToday,
  badgeIcon,
  className,
  members = [],
  calendarId,
  onMemberInvited,
}: CalendarBoardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1 px-2.5 py-0.5 text-xs">
          {badgeIcon ? <Icon icon={badgeIcon} size="sm" /> : null}
          {badgeLabel}
        </Badge>
        <div className="flex items-center space-x-0.5">
          {members.slice(0, 5).map((member) => (
            <UserAvatar
              key={member.userId}
              userId={member.userId}
              name={member.name}
              avatarUrl={member.avatarUrl}
              size="sm"
              className="border-2 border-background ring-0"
            />
          ))}
          {members.length > 5 && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground ring-0">
              +{members.length - 5}
            </div>
          )}
          {calendarId && (
            <MemberInviteDialog
              calendarId={calendarId}
              onInvited={onMemberInvited}
            />
          )}
        </div>
      </div>
      <div
        className={cn(
          "flex items-center gap-1.5 text-sm",
          // ライトモード
          "text-stone-700",
          // ダークモード
          "dark:text-white/80",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md border transition",
            // ライトモード: 温かみのあるストーン系
            "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white",
          )}
          onClick={onPrev}
          aria-label="前の月"
        >
          <Icon icon={ChevronLeft} size="sm" />
        </Button>
        <span className="min-w-[5.75rem] text-center font-medium">
          {monthLabel}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md border transition",
            // ライトモード
            "border-stone-300 bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20 dark:hover:text-white",
          )}
          onClick={onNext}
          aria-label="次の月"
        >
          <Icon icon={ChevronRight} size="sm" />
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "ml-1 rounded-md border px-2 py-1 text-xs transition",
            // ライトモード
            "border-stone-300 bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-800",
            // ダークモード
            "dark:border-white/10 dark:bg-transparent dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white",
          )}
          onClick={onToday}
        >
          今月
        </Button>
      </div>
    </div>
  );
}
