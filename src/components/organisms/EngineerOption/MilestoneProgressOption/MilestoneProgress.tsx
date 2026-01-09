import type { Milestone } from "@/types/github";

export function MilestoneProgress({ title, progress, open, close }: Milestone) {
  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="w-full text-sm font-semibold leading-none text-foreground">
          {title}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-row justify-between">
        <span className="text-sm font-semibold text-foreground text-left">
          {progress}% 完了
        </span>
        <span className="text-xs text-muted-foreground text-right">
          (Open: {open}, Closed: {close})
        </span>
      </div>
    </div>
  );
}
