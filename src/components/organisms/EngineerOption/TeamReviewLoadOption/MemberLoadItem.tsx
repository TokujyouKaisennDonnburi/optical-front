import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/atoms/DropdownMenu";
import type {
  ChangeReviewerRequest,
  GitHubReviewer,
  GitHubUser,
  ReviewLoadLevel,
  TeamMemberReviewLoad,
} from "@/types/github";
import { cn } from "@/utils_constants_styles/utils";

const loadLevelColors: Record<ReviewLoadLevel, string> = {
  high: "bg-destructive",
  medium: "bg-amber-400",
  low: "bg-emerald-500",
};

const fallbackLevelLabels: Record<ReviewLoadLevel, string> = {
  high: "高負荷",
  medium: "中負荷",
  low: "空きあり",
};

interface MemberLoadItemProps {
  member: GitHubReviewer;
  onReviewerChange?: (payload: ChangeReviewerRequest) => void;
}

export function MemberLoadItem({ member }: MemberLoadItemProps) {
  const [isPrListOpen, setIsPrListOpen] = useState(false);
  const safeRate = Math.max(0, Math.min(1, member.assigned));
  const loadLevel: ReviewLoadLevel =
    member.assigned > 3 ? "high" : member.assigned > 2 ? "medium" : "low";
  const levelText = fallbackLevelLabels[loadLevel];
  const barColor = loadLevelColors[loadLevel];
  const pendingCount = member.assigned;
  const displayedReviewCount =
    pendingCount > 0 ? pendingCount : member.assigned;
  const prListId = useId();

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="w-full text-sm font-semibold leading-none text-foreground sm:w-24">
          @{member.githubName}
        </span>
        <div className="flex-1 min-w-0">
          <div className="h-2 w-full overflow-hidden rounded-full bg-border">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-200",
                barColor,
              )}
              style={{ width: `${safeRate * 100}%` }}
            />
          </div>
        </div>
        <div className="flex flex-row items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-col sm:items-end sm:text-right">
          <span className="text-sm font-semibold text-foreground">
            {displayedReviewCount}件
          </span>
          {levelText ? (
            <span className="truncate text-xs text-muted-foreground">
              {levelText}
            </span>
          ) : null}
        </div>
      </div>

      {pendingCount > 0 ? (
        <div className="space-y-2">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              aria-expanded={isPrListOpen}
              aria-controls={prListId}
              onClick={() => setIsPrListOpen((prev) => !prev)}
            >
              PR一覧 ({pendingCount})
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isPrListOpen ? "rotate-180" : "rotate-0",
                )}
              />
            </Button>
          </div>
          <div
            id={prListId}
            className={cn(
              "space-y-2 rounded-lg border bg-muted/40 p-3",
              !isPrListOpen && "hidden",
            )}
          ></div>
        </div>
      ) : null}
    </div>
  );
}
