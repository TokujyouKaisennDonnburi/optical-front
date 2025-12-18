import { ExternalLink } from "lucide-react";
import type { Milestone } from "@/types/github";

export function MilestoneProgress({
  name,
  openIssues,
  closedIssues,
  url,
}: Milestone) {
  const total = openIssues + closedIssues;
  const progress = total === 0 ? 0 : Math.round((closedIssues / total) * 100);

  const MilestoneTitle = () => (
    <span className="w-full text-sm font-semibold leading-none text-foreground">
      🚩{name}
    </span>
  );

  return (
    <div className="space-y-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {url ? (
          <a
            href={url}
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
          (Open: {openIssues}, Closed: {closedIssues})
        </span>
      </div>
    </div>
  );
}
