"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Mail, Plus, Trash2, User, Users } from "lucide-react";
import { type KeyboardEvent, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Text } from "@/components/atoms/Text";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarWizardMembersFormProps = {
  members: Array<{ id: string; email: string }>;
  onChangeMember: (memberId: string, email: string) => void;
  onAddMember: (email?: string) => void;
  onRemoveMember: (memberId: string) => void;
  hasError: boolean;
  useSolo: boolean;
  onToggleUseSolo: (checked: boolean) => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CalendarWizardMembersForm({
  members,
  onAddMember,
  onRemoveMember,
  hasError,
  useSolo,
  onToggleUseSolo,
}: CalendarWizardMembersFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAddParams = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!EMAIL_REGEX.test(trimmed)) {
      setInputError("メールアドレスの形式が正しくありません");
      return;
    }

    const isDuplicate = members.some(
      (m) => m.email.toLowerCase() === trimmed.toLowerCase(),
    );

    if (isDuplicate) {
      setInputError("このメンバーは既に追加されています");
      return;
    }

    onAddMember(trimmed);
    setInputValue("");
    setInputError(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddParams();
    }
  };

  const activeOptionClasses =
    "border-primary ring-2 ring-primary/20 bg-primary/5";
  const inactiveOptionClasses = "hover:border-primary/50 hover:bg-muted/50";

  return (
    <section className="space-y-8">
      <header className="space-y-2 text-center sm:text-left">
        <Text as="h2" size="lg" weight="bold">
          利用スタイルを選択
        </Text>
        <Text size="sm" className="text-muted-foreground">
          カレンダーをどのように利用するか教えてください。
          <br className="hidden sm:inline" />
          この設定は後からでも変更できます。
        </Text>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Solo Option */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className={cn(
              "cursor-pointer transition-all duration-300 relative overflow-hidden h-full",
              useSolo ? activeOptionClasses : inactiveOptionClasses,
            )}
            onClick={() => onToggleUseSolo(true)}
          >
            <div className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
              <div
                className={cn(
                  "p-4 rounded-full transition-colors",
                  useSolo
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Text weight="bold" size="lg">
                  自分だけで使う
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  プライベートな予定管理や
                  <br />
                  メモとして使いたい方
                </Text>
              </div>
              {useSolo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 text-primary"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Team Option */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className={cn(
              "cursor-pointer transition-all duration-300 relative overflow-hidden h-full",
              !useSolo ? activeOptionClasses : inactiveOptionClasses,
            )}
            onClick={() => onToggleUseSolo(false)}
          >
            <div className="p-6 flex flex-col items-center text-center gap-4 h-full justify-center">
              <div
                className={cn(
                  "p-4 rounded-full transition-colors",
                  !useSolo
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <Text weight="bold" size="lg">
                  チームで共有する
                </Text>
                <Text size="sm" className="text-muted-foreground">
                  家族やパートナー、
                  <br />
                  同僚と予定を共有したい方
                </Text>
              </div>
              {!useSolo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute top-3 right-3 text-primary"
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {!useSolo && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="overflow-hidden"
          >
            <Card className="border-dashed">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <Text weight="medium">メンバーを招待</Text>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="invited-member@example.com"
                          className={cn(
                            "pl-9",
                            inputError &&
                              "border-destructive focus-visible:ring-destructive",
                          )}
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            if (inputError) setInputError(null);
                          }}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      {inputError && (
                        <motion.p
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-xs text-destructive font-medium ml-1"
                        >
                          {inputError}
                        </motion.p>
                      )}
                    </div>
                    <Button
                      onClick={handleAddParams}
                      disabled={!inputValue.trim()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      追加
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Text size="sm" className="text-muted-foreground">
                      招待予定のメンバー ({members.length}名)
                    </Text>
                    {hasError && (
                      <Text size="sm" className="text-destructive font-medium">
                        ※少なくとも1名の追加が必要です
                      </Text>
                    )}
                  </div>

                  {members.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border rounded-lg bg-muted/20 border-border/50">
                      <Users className="w-8 h-8 mb-2 opacity-20" />
                      <Text size="sm">まだメンバーが追加されていません</Text>
                    </div>
                  ) : (
                    <motion.ul
                      className="grid gap-3 grid-cols-1 sm:grid-cols-2"
                      layout
                    >
                      <AnimatePresence mode="popLayout">
                        {members.map((member) => (
                          <motion.li
                            key={member.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          >
                            <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group">
                              <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                                  {member.email.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <Text
                                  size="sm"
                                  weight="medium"
                                  className="truncate"
                                  title={member.email}
                                >
                                  {member.email}
                                </Text>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onRemoveMember(member.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="sr-only">削除</span>
                              </Button>
                            </div>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </motion.ul>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
