import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { ConfirmModal } from "@/components/molecules/ConfirmModal/ConfirmModal";
import { AccountMenu } from "./AccountMenu";

const meta: Meta<typeof AccountMenu> = {
  title: "Organisms/AccountMenu",
  component: AccountMenu,
  args: {
    menuWidthClass: "w-60",
    avatarSizeClass: "h-12 w-12",
  },
};
export default meta;

type Story = StoryObj<typeof AccountMenu>;

export const Default: Story = {
  args: {
    user: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      iconUrl: "https://i.pravatar.cc/100?img=10",
    },
    onRequestEmailSave: (newEmail: string) =>
      console.log("Saving email:", newEmail),
  },
};

export const WithLongText: Story = {
  args: {
    user: {
      id: "2",
      name: "Johnathan Verylongusername Example",
      email: "verylongemailaddress@example-domain.com",
      iconUrl: "https://i.pravatar.cc/100?img=20",
    },
    onRequestEmailSave: (newEmail: string) =>
      console.log("Saving email:", newEmail),
  },
};

export const WithoutAvatar: Story = {
  args: {
    user: {
      id: "3",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      iconUrl: undefined,
    },
    onRequestEmailSave: (newEmail: string) =>
      console.log("Saving email:", newEmail),
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    user: null,
    onRequestEmailSave: () => {},
  },
};

export const ErrorState: Story = {
  args: {
    error: new Error("ユーザー情報の取得に失敗しました"),
    user: null,
    onRequestEmailSave: () => {},
  },
};

export const NoUser: Story = {
  args: {
    user: null,
    onRequestEmailSave: () => {},
  },
};

// ✅ Storybook上で ConfirmModal を開けるようにしたストーリー
export const WithModal: Story = {
  render: (args) => {
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [pendingEmail, setPendingEmail] = React.useState<string | null>(null);

    const handleRequestEmailSave = (newEmail: string) => {
      setPendingEmail(newEmail);
      setIsConfirmOpen(true);
    };

    const handleConfirm = () => {
      console.log("Confirmed email:", pendingEmail);
      setIsConfirmOpen(false);
      setPendingEmail(null);
    };

    const handleCancel = () => {
      setIsConfirmOpen(false);
      setPendingEmail(null);
    };

    return (
      <>
        <AccountMenu {...args} onRequestEmailSave={handleRequestEmailSave} />
        <ConfirmModal
          isOpen={isConfirmOpen}
          message={`メールアドレスを「${pendingEmail}」に変更しますか？`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          saveButtonText="変更する"
        />
      </>
    );
  },
  args: {
    user: {
      id: "4",
      name: "Modal Tester",
      email: "test@example.com",
      iconUrl: "https://i.pravatar.cc/100?img=25",
    },
  },
};
