"use client";

import { Plus } from "lucide-react";
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

export interface AddTaskDialogProps {
  isOpen: boolean;
  sectionName?: string;
  onClose: () => void;
  onSubmit: (taskName: string) => void;
}

export function AddTaskDialog({
  isOpen,
  sectionName,
  onClose,
  onSubmit,
}: AddTaskDialogProps) {
  const [taskName, setTaskName] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ダイアログを開いたらフォーカス
  React.useEffect(() => {
    if (isOpen) {
      setTaskName("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(taskName.trim());
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
          <DialogTitle>タスクを追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {sectionName && (
              <p className="text-sm text-muted-foreground">
                「{sectionName}」にタスクを追加
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="task-name">タスク名</Label>
              <Input
                ref={inputRef}
                id="task-name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="新しいタスク..."
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
            <Button type="submit" disabled={!taskName.trim() || isSubmitting}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
