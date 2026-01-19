"use client";

import type { Availability } from "@/components/atoms/AvailabilityRadioGroup";
import { AvailabilityRadioGroup } from "@/components/atoms/AvailabilityRadioGroup";
import { Text } from "@/components/atoms/Text";

type Props = {
  date: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  value?: Availability;
  onChange: (value: Availability) => void;
};

export function AvailabilityRow({
  date,
  defaultStartTime,
  defaultEndTime,
  value,
  onChange,
}: Props) {
  const displayTime =
    defaultStartTime && defaultEndTime
      ? `${defaultStartTime}〜${defaultEndTime}`
      : defaultStartTime || defaultEndTime || "";

  return (
    <div className="flex items-center justify-between rounded-xl dark:bg-white bg-gray-800 px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{date}</span>
        {displayTime && (
          <Text size="sm" className="text-gray-400">
            {displayTime}
          </Text>
        )}
      </div>

      <AvailabilityRadioGroup value={value} onChange={onChange} size="sm" />
    </div>
  );
}
