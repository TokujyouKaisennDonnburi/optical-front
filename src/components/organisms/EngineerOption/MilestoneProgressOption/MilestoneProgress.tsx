import { ExternalLink } from "lucide-react";

type MilestoneProgressProps = {
  open: number;
  closed: number;
  milestoneName: string;
  milestoneUrl?: string;
};

export function MilestoneProgress({
  open,
  closed,
  milestoneName,
  milestoneUrl,
}: MilestoneProgressProps) {
  const total = open + closed;
  const progress = total === 0 ? 0 : Math.round((closed / total) * 100);

  const MilestoneTitle = () => (
    <span className="w-full text-sm font-semibold leading-none text-foreground">
      🚩{milestoneName}
    </span>
  );

  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {milestoneUrl ? (
          <a
            href={milestoneUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline"
          >
            <MilestoneTitle />
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>
        ) : (
          <MilestoneTitle />
        )}
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
          (Open: {open}, Closed: {closed})
        </span>
      </div>
    </div>
  );
}
