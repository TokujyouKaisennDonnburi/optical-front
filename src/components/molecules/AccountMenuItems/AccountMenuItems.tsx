import * as React from "react";
import { DropdownMenuItem } from "@/components/atoms/DropdownMenu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/atoms/Avatar";
import { Pencil } from "lucide-react";

// バリデーション関数
const validateEmail = (email: string): boolean => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

type AccountMenuItemsProps = {
  name: string;
  email: string;
  avatarUrl?: string;
  items: {
    label: string;
    icon: React.ReactNode;
    onSelect: () => void;
  }[];
  onRequestEmailSave?: (newEmail: string) => void; // 親に渡す
};

export function AccountMenuItems({
  name,
  email,
  avatarUrl,
  items,
  onRequestEmailSave,
}: AccountMenuItemsProps) {
  // 編集中のフィールドを管理（"name", "email", "icon"）
  const [editingField, setEditingField] = React.useState<
    "name" | "email" | "icon" | null
  >(null);

  // 編集された値を保持するステート
  const [editedName, setEditedName] = React.useState(name);
  const [editedEmail, setEditedEmail] = React.useState(email);
  const [editedAvatar, setEditedAvatar] = React.useState(avatarUrl ?? "");
  const [emailError, setEmailError] = React.useState<string | null>(null);

  // 初期値の保持 (useRefで一度だけ保持)
  const originalNameRef = React.useRef(name);
  const originalEmailRef = React.useRef(email);
  const originalAvatarRef = React.useRef(avatarUrl ?? "");

  // 編集開始時に元の値を復元
  const handleEdit = (field: "name" | "email" | "icon") => {
    setEditingField(field);
    setEmailError(null);
  };

  // キャンセル処理 (元の値に戻す)
  const handleCancel = () => {
    setEditedName(originalNameRef.current);
    setEditedEmail(originalEmailRef.current);
    setEditedAvatar(originalAvatarRef.current);
    setEmailError(null);
    setEditingField(null);
  };

  // 保存処理 (メールアドレスのバリデーションも行う)
  const handleSave = () => {
    // メールアドレスが変更されていない場合
    if (editingField === "email") {
      // メールアドレスが有効かチェック
      if (!validateEmail(editedEmail)) {
        setEmailError("有効なメールアドレスを入力してください。");
        return;
      }

      // 値が変更されていなければ何もしない
      if (editedEmail === originalEmailRef.current) {
        setEditingField(null); // 編集モードを終了する
        return;
      }

      // メールアドレスが有効なら親に保存要求を通知
      onRequestEmailSave?.(editedEmail);
      return;
    }

    // ユーザー名とアバターの変更チェック
    const isNameChanged = editedName !== originalNameRef.current;
    const isAvatarChanged = editedAvatar !== originalAvatarRef.current;

    // ユーザー名またはアバターが変更されていない場合
    if (!isNameChanged && !isAvatarChanged) {
      setEditingField(null); // 変更がなければ編集モードを終了する
      return;
    }

    doSave();
  };

  // 保存処理 (名前やアバターが保存される)
  const doSave = () => {
    // 保存後に元の値を更新
    originalNameRef.current = editedName;
    originalEmailRef.current = editedEmail;
    originalAvatarRef.current = editedAvatar;

    // ここで実際の保存処理を実装
    console.log("保存:", { editedName, editedEmail, editedAvatar });

    // 編集状態を解除
    setEditingField(null);
  };

  // アバター画像変更時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setEditedAvatar(reader.result as string); // 読み込んだ画像をステートにセット
    };
    reader.readAsDataURL(file); // 画像をDataURLとして読み込む
  };

  return (
    <div className="flex flex-col w-full">
      {/* プロフィール情報 */}
      <div className="relative flex flex-col items-center p-4 text-center">
        {/* アバターと編集ボタン */}
        <div className="relative">
          <Avatar className="w-16 h-16 overflow-hidden rounded-full">
            {editedAvatar ? (
              <AvatarImage
                src={editedAvatar}
                alt={editedName}
                className="object-cover"
              />
            ) : (
              <AvatarFallback>{editedName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>

          {/* 編集アイコン */}
          <label className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow cursor-pointer">
            <Pencil className="h-3 w-3 text-gray-600" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
        </div>

        {/* ユーザー名 */}
        <div className="relative flex items-center justify-center mt-2 w-full">
          {editingField === "name" ? (
            <input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full border rounded px-2 text-sm"
            />
          ) : (
            <div
              className="text-sm font-medium truncate text-center ml-5"
              title={editedName}
            >
              {editedName}
            </div>
          )}
          {editingField !== "name" && (
            <button
              onClick={() => handleEdit("name")}
              className="ml-2 p-1 flex items-center justify-center"
            >
              <Pencil className="h-3 w-3 text-gray-600" />
            </button>
          )}
        </div>

        {/* メールアドレス */}
        <div className="relative flex items-center justify-center mt-1 w-full text-xs text-center text-gray-500">
          {editingField === "email" ? (
            <>
              <input
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="w-full border rounded px-2 text-xs"
              />
              {emailError && (
                <div className="mt-1 text-red-500 text-[10px] leading-none whitespace-nowrap">
                  {emailError}
                </div>
              )}
            </>
          ) : (
            <div className="truncate text-center ml-5" title={editedEmail}>
              {editedEmail}
            </div>
          )}
          {editingField !== "email" && (
            <button
              onClick={() => handleEdit("email")}
              className="ml-2 p-1 flex items-center justify-center"
            >
              <Pencil className="h-3 w-3 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* 編集時の保存／キャンセルボタン */}
      {editingField && (
        <div className="flex justify-center gap-2 px-4 pb-2">
          <button
            onClick={handleSave}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="px-2 py-1 text-xs bg-gray-300 rounded"
          >
            キャンセル
          </button>
        </div>
      )}

      {/* 区切り線 */}
      <hr className="my-2" />

      {/* メニューアイテム */}
      {items.map((item, index) => (
        <DropdownMenuItem
          key={index}
          onSelect={(e) => {
            e.preventDefault();
            item.onSelect?.();
          }}
          className="flex items-center gap-3 px-4 py-3 text-sm"
        >
          {item.icon}
          <span className="text-sm">{item.label}</span>
        </DropdownMenuItem>
      ))}
    </div>
  );
}
