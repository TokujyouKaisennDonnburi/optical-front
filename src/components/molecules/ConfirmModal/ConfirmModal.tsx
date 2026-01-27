import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Input } from "@/components/atoms/Input";
import { cn } from "@/utils_constants_styles/utils";

// 確認モーダルのプロパティ型定義
type ConfirmModalProps = {
  isOpen: boolean; // モーダルが開いているかどうか
  title?: string; // モーダルのタイトル
  message: string;
  onConfirm: () => void; // 確認ボタン押下時の処理
  onCancel: () => void; // キャンセルボタン押下時の処理
  saveButtonText?: string; // 保存ボタンのテキストをプロパティとして渡す
  variant?: "default" | "destructive"; // ボタンのスタイル
  confirmationText?: string; // 確認用テキスト
};

// 確認モーダルのコンポーネント
export function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  saveButtonText = "保存", // デフォルトのテキストを指定
  variant = "default",
  confirmationText,
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (confirmationText) {
      setIsConfirmed(inputValue === confirmationText);
    } else {
      setIsConfirmed(true);
    }
  }, [inputValue, confirmationText]);

  useEffect(() => {
    if (!isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  return (
    // Dialogコンポーネントはモーダル全体をラップする
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      {/* モーダルコンテンツの定義 */}
      <DialogContent className="sm:max-w-md">
        {/* モーダルのヘッダー */}
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle> {/* モーダルのタイトル */}
        </DialogHeader>

        {/* メッセージの表示部分 */}
        <div className="text-sm text-gray-700">{message}</div>

        {confirmationText && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-500">
              続行するにはカレンダー名を入力してください
              <br />
              <strong>{confirmationText}</strong>
            </p>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="mt-2"
            />
          </div>
        )}

        {/* モーダルのフッターにボタンを配置 */}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          {/* キャンセルボタン */}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="px-4 py-1 rounded"
          >
            キャンセル
          </Button>

          {/* 保存ボタン */}
          <Button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className={cn(
              "px-4 py-1 rounded",
              variant === "destructive"
                ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
                : "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300",
            )}
          >
            {saveButtonText} {/* 外部から渡されたテキストを表示 */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
