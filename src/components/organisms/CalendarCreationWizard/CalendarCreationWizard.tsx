"use client";

import { CheckCircle2, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/atoms/Card";
import { Text } from "@/components/atoms/Text";
import { CalendarWizardDetailsForm } from "@/components/molecules/CalendarWizardDetailsForm";
import { CalendarWizardMembersForm } from "@/components/molecules/CalendarWizardMembersForm";
import {
  type CalendarWizardCustomOption,
  CalendarWizardOptionsForm,
  type CalendarWizardTemplate,
} from "@/components/molecules/CalendarWizardOptionsForm";
import { CalendarWizardStepIndicator } from "@/components/molecules/CalendarWizardStepIndicator";
import { CalendarWizardSummary } from "@/components/molecules/CalendarWizardSummary";
import { ConfirmModal } from "@/components/molecules/ConfirmModal";
import {
  createCalendar,
  inviteMembers,
  uploadCalendarImage,
} from "@/lib/api-calendars";
import { ApiClientError } from "@/lib/api-client";
import type { CreateCalendarRequest } from "@/types/schedule";

type StepKey = 0 | 1 | 2;

type MemberInvite = {
  id: string;
  email: string;
};

type CalendarCreationState = {
  name: string;
  color: string;
  imageId: string | null;
  members: MemberInvite[];
  selectedTemplateId: string | null;
  customOptions: Record<number, boolean>;
  useSolo: boolean;
  createdCalendarId: string | null;
};

const STEPS = [
  { label: "カレンダー名の指定" },
  { label: "メンバー招待" },
  { label: "オプション選択" },
] satisfies Array<{ label: string }>;

const COLOR_OPTIONS = [
  "#f97316",
  "#22c55e",
  "#0ea5e9",
  "#8b5cf6",
  "#ef4444",
  "#eab308",
  "#14b8a6",
  "#f472b6",
  "#4b5563",
  "#6366f1",
];

const TEMPLATE_OPTIONS: CalendarWizardTemplate[] = [
  {
    id: "simple",
    name: "ミニマリスト",
    badge: "Minimal",
    description:
      "オプションなしの最もシンプルなカレンダー。\n新規予定の追加のみ。",
    accentColor: "#64748b",
    features: [],
  },
  {
    id: "general",
    name: "一般",
    badge: "Basic",
    description: "シンプルで汎用的なカレンダーテンプレート。",
    accentColor: "#22c55e",
    features: [
      { label: "予定管理", included: true },
      { label: "メンバー共有", included: true },
      { label: "リマインダー", included: true },
    ],
  },
  {
    id: "engineer",
    name: "エンジニア",
    badge: "Tech",
    description: "開発サイクルとリリース管理に最適化されたテンプレート。",
    accentColor: "#a855f7",
    features: [
      { label: "PRレビュー待ち件数", included: true },
      { label: "チームレビュー負荷可視化", included: true },
      { label: "マイルストーン進捗", included: true },
    ],
  },
];

const CUSTOM_OPTIONS_WITH_DEFAULT: Array<
  CalendarWizardCustomOption & { defaultChecked?: boolean }
> = [
  // Engineer - 実装済みオプションのみ
  {
    id: 1,
    name: "pull_request_review_wait_count",
    label: "PRレビュー待ち件数",
    description: "自分のレビュー待ちPR数を表示します。",
    category: "engineer",
  },
  {
    id: 2,
    name: "team_review_load",
    label: "レビュー負荷",
    description: "チーム全体のレビュー状況を可視化します。",
    category: "engineer",
  },
  {
    id: 5,
    name: "milestone_progress",
    label: "マイルストーン達成率",
    description:
      "GitHub連携により、マイルストーンの進捗状況をプレビューに表示します。",
    category: "engineer",
  },

  // General - 一般・便利機能
  {
    id: 6,
    name: "scheduler",
    label: "スケジューラー",
    description: "メンバーの予定を簡単に調整できます。",
    category: "general",
  },
  {
    id: 7,
    name: "todo",
    label: "ToDoリスト",
    description:
      "カレンダーにToDoリスト機能を追加します。タスク管理が可能になります。",
    category: "general",
  },
];

const CUSTOM_OPTION_ITEMS: CalendarWizardCustomOption[] =
  CUSTOM_OPTIONS_WITH_DEFAULT.map(({ defaultChecked, ...rest }) => rest);

// テンプレートIDとカスタムオプションIDのマッピング
const TEMPLATE_OPTION_MAPPING: Record<string, number[]> = {
  engineer: [1, 2, 5],
  general: [6, 7], // 一般テンプレートはTo-doリストを含む
  simple: [], // シンプルテンプレートはオプションなし
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // メールアドレス形式チェック

const generateMemberId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `member-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

const createInitialState = (): CalendarCreationState => ({
  name: "",
  color: COLOR_OPTIONS[0],
  imageId: null,
  members: [],
  selectedTemplateId: null,
  customOptions: CUSTOM_OPTIONS_WITH_DEFAULT.reduce<Record<string, boolean>>(
    (acc, option) => {
      acc[option.id] = Boolean(option.defaultChecked);
      return acc;
    },
    {},
  ),
  useSolo: true,
  createdCalendarId: null,
});

export function CalendarCreationWizard() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<StepKey>(0);
  const [state, setState] = useState<CalendarCreationState>(createInitialState);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleNameChange = (next: string) => {
    setState((prev) => ({
      ...prev,
      name: next,
    }));
  };

  const handleColorSelect = (color: string) => {
    setState((prev) => ({
      ...prev,
      color,
    }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setImageError("PNGまたはJPG形式の画像を選択してください。");
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
      return;
    }
    try {
      const image = await uploadCalendarImage(file);
      setImagePreviewUrl(image.url);
      setState((prev) => ({
        ...prev,
        imageId: image.id,
      }));
    } catch (_) {
      setImagePreviewUrl(null);
      setImageError("プレビューの読み込みに失敗しました。");
      setState((prev) => ({
        ...prev,
        imageFile: null,
      }));
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    setState((prev) => ({
      ...prev,
      imageFile: null,
    }));
    setImagePreviewUrl(null);
    setImageError(null);
  };

  const handleMemberChange = (memberId: string, email: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((member) =>
        member.id === memberId ? { ...member, email } : member,
      ),
    }));
  };

  const handleAddMember = (email?: string) => {
    setState((prev) => ({
      ...prev,
      members: [
        ...prev.members,
        {
          id: generateMemberId(),
          email: email ?? "",
        },
      ],
    }));
  };

  const handleRemoveMember = (memberId: string) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((member) => member.id !== memberId),
    }));
  };

  const handleSelectTemplate = (templateId: string | null) => {
    setState((prev) => {
      const updatedOptions = { ...prev.customOptions };

      // 以前選択されていたテンプレートがあれば、そのオプションをOFFにする
      if (prev.selectedTemplateId) {
        const prevOptionIds =
          TEMPLATE_OPTION_MAPPING[prev.selectedTemplateId] || [];
        for (const optionId of prevOptionIds) {
          updatedOptions[optionId] = false;
        }
      }

      // 新しいテンプレートが選択されていれば、そのオプションをONにする
      if (templateId) {
        const optionIds = TEMPLATE_OPTION_MAPPING[templateId] || [];
        for (const optionId of optionIds) {
          updatedOptions[optionId] = true;
        }
      }

      return {
        ...prev,
        selectedTemplateId: templateId,
        customOptions: updatedOptions,
      };
    });
  };

  const handleToggleCustomOption = (optionId: number) => {
    setState((prev) => {
      const newValue = !prev.customOptions[optionId];
      const updatedOptions = {
        ...prev.customOptions,
        [optionId]: newValue,
      };

      // オプションをOFFにした場合、そのオプションが選択中のテンプレートに含まれているかチェック
      let newTemplateId = prev.selectedTemplateId;
      if (!newValue && prev.selectedTemplateId) {
        const templateOptionIds =
          TEMPLATE_OPTION_MAPPING[prev.selectedTemplateId] || [];
        // テンプレートに含まれるオプションをOFFにした場合、テンプレートを解除
        if (templateOptionIds.includes(optionId)) {
          newTemplateId = null;
        }
      }

      return {
        ...prev,
        selectedTemplateId: newTemplateId,
        customOptions: updatedOptions,
      };
    });
  };

  const handleToggleUseSolo = (checked: boolean) => {
    setState((prev) => ({
      ...prev,
      useSolo: checked,
    }));
  };

  const stepValidity = useMemo(() => {
    const trimmedName = state.name.trim();
    const hasValidName = trimmedName.length > 0;
    const hasColor = Boolean(state.color);

    // メールアドレスのバリデーション
    const memberValidity = state.members.every((member) => {
      const trimmed = member.email.trim();
      if (!trimmed) {
        return true;
      }
      return EMAIL_REGEX.test(trimmed);
    });

    // 重複チェック: 同じメールアドレスが複数存在しないか
    const emailSet = new Set<string>();
    const hasDuplicateEmails = state.members.some((member) => {
      const trimmed = member.email.trim().toLowerCase();
      if (!trimmed) {
        return false; // 空のメールアドレスは重複チェックの対象外
      }
      if (emailSet.has(trimmed)) {
        return true; // 重複発見
      }
      emailSet.add(trimmed);
      return false;
    });

    // 一人で使う場合は常にOK、そうでない場合は少なくとも1名の有効なメールアドレスが必要
    const hasMemberRequirement =
      state.useSolo ||
      state.members.some(
        (member) =>
          member.email.trim() && EMAIL_REGEX.test(member.email.trim()),
      );

    const templateExists =
      state.selectedTemplateId === null ||
      TEMPLATE_OPTIONS.some((item) => item.id === state.selectedTemplateId);

    return {
      0: hasValidName && hasColor,
      1: memberValidity && hasMemberRequirement && !hasDuplicateEmails,
      2: templateExists,
    } as Record<StepKey, boolean>;
  }, [
    state.color,
    state.members,
    state.name,
    state.selectedTemplateId,
    state.useSolo,
  ]);

  const handleNext = () => {
    if (step === 2 || !stepValidity[step]) {
      return;
    }
    setStep((prev) => (prev + 1) as StepKey);
  };

  const handlePrev = () => {
    if (step === 0) {
      router.back();
      return;
    }
    setStep((prev) => (prev - 1) as StepKey);
  };

  const handleSubmit = async () => {
    if (!stepValidity[2]) {
      return;
    }
    setIsSubmitting(true);
    setIsConfirmModalOpen(false);

    try {
      // 招待するメールアドレスのリスト
      const memberEmails = state.useSolo
        ? []
        : state.members
            .map((member) => member.email.trim())
            .filter((email) => email.length > 0);

      const payload: CreateCalendarRequest = {
        name: state.name.trim(),
        color: state.color,
        members: memberEmails,
        optionIds: Object.entries(state.customOptions)
          .filter(([, enabled]) => enabled)
          .map(([id]) => Number(id)),
        imageId: state.imageId,
      };

      console.log(
        "[CalendarCreationWizard] Calling POST /api/calendars",
        payload,
      );
      const response = await createCalendar(payload);

      // カレンダー作成後、メンバーがいれば招待APIを呼び出す
      if (memberEmails.length > 0) {
        console.log(
          "[CalendarCreationWizard] Calling POST /api/calendars/" +
            response.id +
            "/invitations",
          memberEmails,
        );
        await inviteMembers(response.id, memberEmails);
      }

      setState((prev) => ({
        ...prev,
        createdCalendarId: response.id,
      }));
      setIsSubmitting(false);
      setIsComplete(true);
      toast.success("カレンダーを作成しました", { duration: 2000 });
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : "カレンダーの作成に失敗しました";
      toast.error(errorMessage, { duration: 2000 });
      console.error("Failed to create calendar:", error);
    }
  };

  const handleConfirmSubmit = () => {
    // テンプレートもカスタムオプションも選択されていない場合
    const hasSelectedTemplate = state.selectedTemplateId !== null;
    const hasSelectedOptions = Object.values(state.customOptions).some(
      (enabled) => enabled,
    );

    if (!hasSelectedTemplate && !hasSelectedOptions) {
      toast.info(
        "オプションが選択されていません。\nミニマリストテンプレートを選択することをおすすめします。",
        { duration: 2000 },
      );
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // 小さな固定配列の検索なのでメモ化不要
  const selectedTemplate = TEMPLATE_OPTIONS.find(
    (item) => item.id === state.selectedTemplateId,
  );

  // 固定配列のフィルタリングなのでメモ化不要
  const activeCustomOptions = CUSTOM_OPTIONS_WITH_DEFAULT.filter(
    (option) => state.customOptions[option.id],
  ).map(({ name, label }) => ({ name, label }));

  // 単純なカウントなのでメモ化不要
  const invitedMembersCount = state.useSolo
    ? 0
    : state.members.filter((member) => member.email.trim()).length;

  if (isComplete) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg">
          <CardHeader className="space-y-3 pb-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <Text as="h2" size="lg" weight="bold" className="text-xl">
                カレンダー作成が完了しました
              </Text>
              <Text size="sm" className="mt-1 text-muted-foreground">
                新しいカレンダーの準備ができました
              </Text>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <CalendarWizardSummary
              name={state.name}
              color={state.color}
              imagePreviewUrl={imagePreviewUrl}
              templateName={selectedTemplate?.name ?? "-"}
              customOptions={activeCustomOptions}
              members={state.members}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="order-2 w-full sm:order-1 sm:w-auto"
              onClick={() => {
                setIsComplete(false);
                setStep(0);
                setState(createInitialState());
                if (imageInputRef.current) {
                  imageInputRef.current.value = "";
                }
                setImagePreviewUrl(null);
              }}
            >
              もう一度作成する
            </Button>
            <Button
              type="button"
              className="order-1 w-full sm:order-2 sm:w-auto"
              onClick={() => {
                if (state.createdCalendarId) {
                  router.push(`/calendars/${state.createdCalendarId}`);
                } else {
                  router.push("/?refresh=true");
                }
              }}
            >
              {state.createdCalendarId
                ? "カレンダーを表示"
                : "ダッシュボードに戻る"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarWizardStepIndicator steps={STEPS} currentIndex={step} />
      <div className="flex-1 overflow-y-auto space-y-6 pb-4 px-1">
        {step === 0 ? (
          <CalendarWizardDetailsForm
            name={state.name}
            color={state.color}
            colorOptions={COLOR_OPTIONS}
            imagePreviewUrl={imagePreviewUrl}
            imageError={imageError}
            onNameChange={handleNameChange}
            onSelectColor={handleColorSelect}
            onImageChange={handleImageChange}
            onRemoveImage={handleRemoveImage}
            imageInputRef={imageInputRef}
          />
        ) : null}
        {step === 1 ? (
          <CalendarWizardMembersForm
            members={state.members}
            onChangeMember={handleMemberChange}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            hasError={!stepValidity[1]}
            useSolo={state.useSolo}
            onToggleUseSolo={handleToggleUseSolo}
          />
        ) : null}
        {step === 2 ? (
          <CalendarWizardOptionsForm
            templates={TEMPLATE_OPTIONS}
            selectedTemplateId={state.selectedTemplateId}
            onSelectTemplate={handleSelectTemplate}
            customOptions={CUSTOM_OPTION_ITEMS}
            selectedCustomOptions={state.customOptions}
            onToggleCustomOption={handleToggleCustomOption}
          />
        ) : null}
      </div>
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-4 px-2 -mx-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          className="w-full sm:w-auto"
          onClick={handlePrev}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {step === 0 ? "戻る" : "前のステップへ"}
        </Button>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {step < 2 ? (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleNext}
              disabled={!stepValidity[step]}
            >
              次へ進む
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleConfirmSubmit}
              disabled={isSubmitting || !stepValidity[2]}
            >
              {isSubmitting ? "作成中..." : "カレンダーを作成"}
            </Button>
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={
          invitedMembersCount > 0
            ? `カレンダー「${state.name}」を作成します。${invitedMembersCount}名のメンバーに招待メールが送信されます。\n\nよろしいですか？`
            : `カレンダー「${state.name}」を作成します。よろしいですか？`
        }
        onConfirm={handleSubmit}
        onCancel={() => setIsConfirmModalOpen(false)}
        saveButtonText="作成する"
      />
    </div>
  );
}
