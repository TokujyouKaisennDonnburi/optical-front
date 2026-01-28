"use client";

import { Mail } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/Dialog";
import { Text } from "@/components/atoms/Text";

export type MembersDialogMember = {
  id: string;
  email: string;
};

export type MembersDialogProps = {
  members: MembersDialogMember[];
  children: React.ReactNode;
};

export function MembersDialog({ members, children }: MembersDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>
            <Text as="span" weight="semibold">
              招待メンバー一覧 ({members.length}名)
            </Text>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-60 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-md border border-border bg-muted/50 p-2"
            >
              <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Text size="sm" className="truncate">
                {member.email}
              </Text>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
