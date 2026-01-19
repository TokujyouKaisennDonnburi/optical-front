"use client";

import { Circle, Triangle, X } from "lucide-react";
import { cn } from "@/utils_constants_styles/utils";

// Availability enum
export type Availability = "ok" | "maybe" | "ng";

interface AvailabilityRadioGroupProps {
  value?: Availability;
  onChange: (value: Availability) => void;
  className?: string;
  disabled?: boolean;
  size?: "default" | "sm"; // Add size prop
}

const options: {
  value: Availability;
  icon: React.ElementType;
  colorClass: string;
}[] = [
  {
    value: "ok",
    icon: Circle,
    colorClass: "text-green-500",
  },
  {
    value: "maybe",
    icon: Triangle,
    colorClass: "text-yellow-500",
  },
  { value: "ng", icon: X, colorClass: "text-red-500" },
];

export function AvailabilityRadioGroup({
  value,
  onChange,
  className,
  disabled = false,
  size = "default", // Default size
}: AvailabilityRadioGroupProps) {
  return (
    <div className={cn("flex space-x-2", className)}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-lg border cursor-pointer transition-all duration-200",
              size === "sm" ? "p-2" : "p-3", // Conditional padding
              "group", // For hover effects
              disabled
                ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                : isSelected
                  ? "bg-primary/20 border-primary text-primary"
                  : "bg-white dark:bg-gray-800 border-gray-700 text-gray-300 hover:bg-primary/20 hover:dark:bg-gray-700 hover:border-gray-600 ",
            )}
          >
            <input
              type="radio"
              name="availability"
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only" // Hide native radio button visually but keep accessible
              disabled={disabled}
            />
            <option.icon
              className={cn(
                size === "sm" ? "h-5 w-5" : "h-6 w-6", // Conditional icon size
                "mb-0.5", // Changed from mb-1
                option.colorClass,
                disabled && "text-gray-500",
                !isSelected &&
                  !disabled &&
                  "group-hover:text-white group-hover:scale-105",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium", // Keep text-xs for all sizes
                disabled && "text-gray-500",
                !isSelected && !disabled && "group-hover:text-white",
              )}
            ></span>
          </label>
        );
      })}
    </div>
  );
}
