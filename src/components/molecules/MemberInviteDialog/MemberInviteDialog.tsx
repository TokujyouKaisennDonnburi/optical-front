"use client";

import { Mail, Plus, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Dialog";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { inviteMembers } from "@/lib/api-calendars";
import { cn } from "@/utils_constants_styles/utils";

// メールアドレス検証用正規表現
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ユニークID生成
let emailIdCounter = 0;
const generateEmailId = () => `email-${++emailIdCounter}`;

type EmailEntry = {
  id: string;
  value: string;
};

export type MemberInviteDialogProps = {
  calendarId: string;
  onInvited?: () => void;
  children?: React.ReactNode;
};

export function MemberInviteDialog({
  calendarId,
  onInvited,
  children,
}: MemberInviteDialogProps) {
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState<EmailEntry[]>([
    { id: generateEmailId(), value: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmail = () => {
    setEmails((prev) => [...prev, { id: generateEmailId(), value: "" }]);
  };

  const handleChangeEmail = (id: string, value: string) => {
    setEmails((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, value } : entry)),
    );
  };

  const handleRemoveEmail = (id: string) => {
    if (emails.length === 1) {
      setEmails([{ id: generateEmailId(), value: "" }]);
    } else {
      setEmails((prev) => prev.filter((entry) => entry.id !== id));
    }
  };

  const handleSubmit = async () => {
    const validEmails = emails
      .map((e) => e.value.trim())
      .filter((e) => e && EMAIL_REGEX.test(e));

    if (validEmails.length === 0) {
      toast.error("有効なメールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      await inviteMembers(calendarId, validEmails);
      toast.success(`${validEmails.length}名に招待を送信しました`);
      setEmails([{ id: generateEmailId(), value: "" }]);
      setOpen(false);
      onInvited?.();
    } catch (error) {
      console.error("Failed to invite members:", error);
      toast.error("招待の送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      // ダイアログを閉じる時にリセット
      setEmails([{ id: generateEmailId(), value: "" }]);
    }
  };

  const hasValidEmail = emails.some(
    (e) => e.value.trim() && EMAIL_REGEX.test(e.value.trim()),
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            {children ?? (
              <button
                type="button"
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full",
                  "border-2 border-dashed border-muted-foreground/50",
                  "text-muted-foreground hover:border-primary hover:text-primary",
                  "transition-colors cursor-pointer",
                )}
              >
                <UserPlus className="h-3 w-3" />
              </button>
            )}
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={4}>
          メンバーを招待
        </TooltipContent>
      </Tooltip>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Text as="span" weight="semibold">
              メンバーを招待
            </Text>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Text size="sm" className="text-muted-foreground">
            招待したいメンバーのメールアドレスを入力してください
          </Text>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {emails.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={entry.value}
                    onChange={(e) =>
                      handleChangeEmail(entry.id, e.target.value)
                    }
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveEmail(entry.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={handleAddEmail}
          >
            <Plus className="h-4 w-4" />
            メールアドレスを追加
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!hasValidEmail || isSubmitting}
          >
            {isSubmitting ? "送信中..." : "招待を送信"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
