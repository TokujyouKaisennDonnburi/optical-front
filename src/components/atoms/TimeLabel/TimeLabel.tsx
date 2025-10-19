import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

type TimeLabelProps = {
  time: string;
  suffix?: string;
  description?: string;
  isCurrent?: boolean;
  className?: string;
};

export function TimeLabel({
  time,
  suffix,
  description,
  isCurrent = false,
  className,
}: TimeLabelProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        "min-w-0",
        isCurrent && "text-primary",
        className,
      )}
    >
      <Text
        as="span"
        size="sm"
        weight={isCurrent ? "semibold" : "normal"}
        className="tabular-nums shrink-0"
      >
        {time}
      </Text>
      {suffix ? (
        <Text as="span" size="sm" className="uppercase shrink-0">
          {suffix}
        </Text>
      ) : null}
      {description ? (
        <Text
          as="span"
          size="sm"
          className={cn(
            "text-xs truncate",
            "min-w-0 flex-1",
            isCurrent ? "text-primary" : "text-muted-foreground",
          )}
          title={description}
        >
          {description}
        </Text>
      ) : null}
    </div>
  );
}
