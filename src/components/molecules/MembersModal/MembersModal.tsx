"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/atoms/Avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { ScrollArea } from "@/components/atoms/ScrollArea";
import { Separator } from "@/components/atoms/Separator";
import { Text } from "@/components/atoms/Text";

type Member = {
  userId: string;
  name: string;
  joinedAt: string; // ISO date string
};

type MembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  calendarName: string;
};

export function MembersModal({
  isOpen,
  onClose,
  members,
  calendarName,
}: MembersModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>「{calendarName}」のメンバー</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[300px]">
          <div className="grid gap-4 py-4">
            {members.length > 0 ? (
              members.map((member, index) => (
                <React.Fragment key={member.userId}>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      {/* TODO: 実際のアバター画像を表示 */}
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${member.userId}`}
                        alt={member.name}
                      />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <Text
                        as="p"
                        size="sm"
                        weight="medium"
                        className="leading-none"
                      >
                        {member.name}
                      </Text>
                      <Text as="p" size="sm" className="text-muted-foreground">
                        参加日:{" "}
                        {new Date(member.joinedAt).toLocaleDateString("ja-JP")}
                      </Text>
                    </div>
                  </div>
                  {index < members.length - 1 && <Separator className="my-2" />}
                </React.Fragment>
              ))
            ) : (
              <Text className="text-muted-foreground">
                このカレンダーにはメンバーがいません。
              </Text>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
