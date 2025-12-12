"use client";

import { Check } from "lucide-react";

import { cn } from "@/utils_constants_styles/utils";

export type CalendarWizardStepIndicatorProps = {
  steps: Array<{
    label: string;
  }>;
  currentIndex: number;
};

export function CalendarWizardStepIndicator({
  steps,
  currentIndex,
}: CalendarWizardStepIndicatorProps) {
  return (
    <ol className="flex flex-wrap gap-2 text-sm">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;

        return (
          <li
            key={step.label}
            className={cn(
              "flex min-w-[11.25rem] flex-1 items-center gap-2 rounded-lg px-3 py-2",
              isCompleted
                ? "bg-primary/5 text-foreground"
                : isActive
                  ? "bg-primary/10 text-foreground"
                  : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full border text-xs font-medium",
                isCompleted
                  ? "border-primary bg-primary text-primary-foreground"
                  : isActive
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-border bg-background text-muted-foreground",
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
            </span>
            <div className="flex flex-col">
              <span className="font-semibold">{step.label}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
