import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

type TimeLabelProps = {
  time: string;
  suffix?: string;
  description?: string;
  isCurrent?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function TimeLabel({
  time,
  suffix,
  description,
  isCurrent = false,
  size = "sm",
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
        size={size}
        weight={isCurrent ? "semibold" : "normal"}
        className="tabular-nums shrink-0"
      >
        {time}
      </Text>
      {suffix ? (
        <Text as="span" size={size} className="uppercase shrink-0">
          {suffix}
        </Text>
      ) : null}
      {description ? (
        <Text
          as="span"
          size={size}
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
