import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { CalendarWizardMembersForm } from "./CalendarWizardMembersForm";

const meta: Meta<typeof CalendarWizardMembersForm> = {
  title: "Molecules/CalendarWizardMembersForm",
  component: CalendarWizardMembersForm,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CalendarWizardMembersForm>;

const createMember = (id: number, email = "") => ({
  id: `member-${id}`,
  email,
});

export const Playground: Story = {
  render: () => {
    const [useSolo, setUseSolo] = useState(false);
    const [members, setMembers] = useState([
      createMember(1, "team@example.com"),
    ]);

    return (
      <div className="max-w-2xl">
        <CalendarWizardMembersForm
          members={members}
          hasError={members.some((member) => {
            const trimmed = member.email.trim();
            return (
              trimmed.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
            );
          })}
          onAddMember={(email) => {
            if (email) {
              setMembers((prev) => [
                ...prev,
                createMember(prev.length + 1, email),
              ]);
            }
          }}
          onRemoveMember={(memberId) => {
            setMembers((prev) =>
              prev.filter((member) => member.id !== memberId),
            );
          }}
          useSolo={useSolo}
          onToggleUseSolo={setUseSolo}
        />
      </div>
    );
  },
};

export const SoloMode: Story = {
  render: () => {
    const [useSolo, setUseSolo] = useState(true);
    const [members, setMembers] = useState<
      Array<{ id: string; email: string }>
    >([]);

    return (
      <div className="max-w-2xl">
        <CalendarWizardMembersForm
          members={members}
          hasError={false}
          onAddMember={(email) => {
            if (email) {
              setMembers((prev) => [
                ...prev,
                createMember(prev.length + 1, email),
              ]);
            }
          }}
          onRemoveMember={(memberId) => {
            setMembers((prev) =>
              prev.filter((member) => member.id !== memberId),
            );
          }}
          useSolo={useSolo}
          onToggleUseSolo={setUseSolo}
        />
      </div>
    );
  },
};
