// src/components/molecules/ConfirmModal/ConfirmModal.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

const meta: Meta<typeof ConfirmModal> = {
  title: "Molecules/ConfirmModal",
  component: ConfirmModal,
};
export default meta;

type Story = StoryObj<typeof ConfirmModal>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleConfirm = () => {
      console.log("保存が確認されました");
      setIsOpen(false);
    };

    const handleCancel = () => {
      console.log("キャンセルされました");
      setIsOpen(false);
    };

    return (
      <div className="p-4">
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          モーダルを開く
        </button>

        <ConfirmModal
          isOpen={isOpen}
          message="変更を保存しますか？"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    );
  },
};
