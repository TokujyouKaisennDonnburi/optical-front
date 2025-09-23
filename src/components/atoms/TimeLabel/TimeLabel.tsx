import { cn } from "@/utils_constants_styles/utils";
import { Text } from "@/components/atoms/Text";

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
        isCurrent && "text-primary",
        className,
      )}
    >
      <Text
        as="span"
        size="sm"
        weight={isCurrent ? "semibold" : "normal"}
        className="tabular-nums"
      >
        {time}
      </Text>
      {suffix ? (
        <Text as="span" size="sm" className="uppercase">
          {suffix}
        </Text>
      ) : null}
      {description ? (
        <Text
          as="span"
          size="sm"
          className={cn(
            "text-xs",
            isCurrent ? "text-primary" : "text-muted-foreground",
          )}
        >
          {description}
        </Text>
      ) : null}
    </div>
  );
}
