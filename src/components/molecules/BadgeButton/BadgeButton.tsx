import { Bell } from "lucide-react";
import React from "react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Icon } from "@/components/atoms/Icon";

type BadgeButtonProps = {
  count?: number;
  label?: string;
  onClick?: () => void;
};

export function BadgeButton({
  count = 0,
  label = "通知",
  onClick,
}: BadgeButtonProps) {
  const hasNotifications = count > 0;

  return (
    <div className="relative">
      <Button size="icon" variant="ghost" onClick={onClick} aria-label={label}>
        <Icon icon={Bell} />
      </Button>
      {hasNotifications && (
        <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center">
          {count}
        </Badge>
      )}
    </div>
  );
}
