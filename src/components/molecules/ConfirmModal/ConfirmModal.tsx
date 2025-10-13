import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";

// 確認モーダルのプロパティ型定義
type ConfirmModalProps = {
  isOpen: boolean; // モーダルが開いているかどうか
  message: string;
  onConfirm: () => void; // 確認ボタン押下時の処理
  onCancel: () => void; // キャンセルボタン押下時の処理
  saveButtonText?: string; // 保存ボタンのテキストをプロパティとして渡す
};

// 確認モーダルのコンポーネント
export function ConfirmModal({
  isOpen,
  message,
  onConfirm,
  onCancel,
  saveButtonText = "保存", // デフォルトのテキストを指定
}: ConfirmModalProps) {
  return (
    // Dialogコンポーネントはモーダル全体をラップする
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      {/* モーダルコンテンツの定義 */}
      <DialogContent className="sm:max-w-md">
        {/* モーダルのヘッダー */}
        <DialogHeader>
          <DialogTitle>確認</DialogTitle> {/* モーダルのタイトル */}
        </DialogHeader>

        {/* メッセージの表示部分 */}
        <div className="text-sm text-gray-700">{message}</div>

        {/* モーダルのフッターにボタンを配置 */}
        <DialogFooter className="mt-4 flex justify-end gap-2">
          {/* キャンセルボタン */}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-red-500 px-4 py-1 rounded"
          >
            キャンセル
          </Button>

          {/* 保存ボタン */}
          <Button
            onClick={onConfirm}
            className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-1 rounded"
          >
            {saveButtonText} {/* 外部から渡されたテキストを表示 */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
