"use client";

import { FolderPlus } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";

export interface AddSectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectionName: string) => void;
}

export function AddSectionDialog({
  isOpen,
  onClose,
  onSubmit,
}: AddSectionDialogProps) {
  const [sectionName, setSectionName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ダイアログを開いたらフォーカス
  React.useEffect(() => {
    if (isOpen) {
      setSectionName("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(sectionName.trim());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>新しいセクション</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              新しいTodoセクションを作成します
            </p>
            <div className="space-y-2">
              <Label htmlFor="section-name">セクション名</Label>
              <Input
                ref={inputRef}
                id="section-name"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="例: 今週のタスク"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={!sectionName.trim() || isSubmitting}
            >
              <FolderPlus className="h-4 w-4 mr-1" />
              作成
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
