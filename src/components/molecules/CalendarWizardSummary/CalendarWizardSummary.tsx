"use client";

import { Check, Eye, Mail } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Dialog";
import { Text } from "@/components/atoms/Text";
import {
  SelectCalendarCard,
  type SelectCalendarCardData,
} from "@/components/molecules/SelectCalendarCard";

export type CalendarWizardSummaryProps = {
  name: string;
  color: string;
  imagePreviewUrl: string | null;
  templateName: string;
  customOptions: Array<{ name: string; label: string }>;
  members: Array<{ id: string; email: string }>;
};

export function CalendarWizardSummary({
  name,
  color,
  imagePreviewUrl,
  templateName,
  customOptions,
  members,
}: CalendarWizardSummaryProps) {
  const activeMembers = members.filter((member) => member.email.trim());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewCalendar: SelectCalendarCardData = {
    id: "calendar-preview",
    name: name.trim() || "名称未設定",
    color,
    imageUrl: imagePreviewUrl ?? undefined,
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-card p-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 shrink-0 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0 flex-1">
              <Text size="sm" weight="medium" className="text-muted-foreground">
                カレンダー名
              </Text>
              <Text
                as="p"
                weight="semibold"
                className="truncate text-foreground"
              >
                {name}
              </Text>
            </div>
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0">
                  <Eye className="mr-2 h-4 w-4" />
                  プレビュー
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    <Text as="span" weight="semibold">
                      カレンダープレビュー
                    </Text>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex justify-center py-4">
                  <SelectCalendarCard
                    calendar={previewCalendar}
                    className="w-full max-w-sm"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div>
          <Text size="sm" weight="medium" className="text-muted-foreground">
            テンプレート
          </Text>
          <Text size="sm" weight="medium" className="text-foreground">
            {templateName}
          </Text>
        </div>
        <div>
          <Text size="sm" weight="medium" className="text-muted-foreground">
            カラー
          </Text>
          <Text size="sm" className="font-mono">
            {color}
          </Text>
        </div>
        {customOptions.length > 0 && (
          <div className="sm:col-span-2">
            <Text size="sm" weight="medium" className="text-muted-foreground">
              オプション
            </Text>
            <div className="mt-1 flex flex-wrap gap-1">
              {customOptions.map((option) => (
                <span
                  key={option.name}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <Check className="h-3 w-3" />
                  {option.label}
                </span>
              ))}
            </div>
          </div>
        )}
        {activeMembers.length > 0 && (
          <div className="sm:col-span-2">
            <Text size="sm" weight="medium" className="text-muted-foreground">
              招待メンバー ({activeMembers.length}名)
            </Text>
            <div className="mt-1 flex flex-wrap gap-1">
              {activeMembers.slice(0, 3).map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                >
                  <Mail className="h-3 w-3" />
                  {member.email.trim()}
                </span>
              ))}
              {activeMembers.length > 3 && (
                <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                  +{activeMembers.length - 3}名
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
