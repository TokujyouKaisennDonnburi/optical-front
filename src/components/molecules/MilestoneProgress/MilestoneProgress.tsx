import React from "react";

type MilestoneProgressProps = {
  open?: number;
  closed?: number;
  milestoneName?: string;
};

export const MilestoneProgress: React.FC<MilestoneProgressProps> = ({
  open = 12,
  closed = 25,
  milestoneName = "11月度",
}) => {
  const total = open + closed;
  const progress = total === 0 ? 0 : Math.round((closed / total) * 100);

  return (
    <div className="space-y-4">
      <div className="font-semibold text-lg flex items-center gap-2">
        <span>🚩</span>
        <span>
          {milestoneName}: {progress}% 完了
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className="h-6 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-gray-700">
        (Open: {open}, Closed: {closed})
      </p>
    </div>
  );
}
