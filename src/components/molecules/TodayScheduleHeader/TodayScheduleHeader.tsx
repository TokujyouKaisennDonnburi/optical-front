import { ReactNode } from "react";

import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

export type TodayScheduleHeaderProps = {
  title: string;
  dateLabel?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function TodayScheduleHeader({
  title,
  dateLabel,
  description,
  actions,
  className,
}: TodayScheduleHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 border-b border-border pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
        className
      )}
    >
      <div className="space-y-1">
        <Text as="span" size="md" weight="semibold" className="text-foreground leading-tight">
          {title}
        </Text>
        {dateLabel ? (
          <Text as="span" size="sm" className="block text-muted-foreground leading-snug">
            {dateLabel}
          </Text>
        ) : null}
        {description ? (
          <Text as="span" size="sm" className="block text-muted-foreground leading-snug">
            {description}
          </Text>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  );
}
