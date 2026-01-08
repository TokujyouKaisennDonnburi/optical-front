import { cn } from "@/utils_constants_styles/utils";

type HolidayLabelProps = {
  name: string;
  className?: string;
  isGaming?: boolean;
};

export function HolidayLabel({
  name,
  className,
  isGaming = true,
}: HolidayLabelProps) {
  return (
    <span
      className={cn(
        "hidden text-[0.625rem] sm:inline-block",
        isGaming ? "animate-gaming-text" : "text-rose-500 dark:text-green-400",
        className,
      )}
    >
      {name}
    </span>
  );
}
