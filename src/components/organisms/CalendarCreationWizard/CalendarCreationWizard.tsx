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
import { createCalendar, uploadCalendarImage } from "@/lib/api-calendars";
import { ApiClientError } from "@/lib/api-client";
import { startMockServiceWorker } from "@/mocks/browser";
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
  customOptions: Record<string, boolean>;
  useSolo: boolean;
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
    id: "engineer",
    name: "エンジニア",
    badge: "Tech",
    description: "開発サイクルとリリース管理に最適化されたテンプレート。",
    accentColor: "#a855f7",
    features: [
      { label: "Git連携", included: true },
      { label: "レビュー負荷可視化", included: true },
      { label: "スプリント管理", included: true },
      { label: "リリース通知", included: true },
    ],
  },
  {
    id: "family",
    name: "ファミリー",
    badge: "Home",
    description: "家族の予定共有と家事分担をスムーズにするテンプレート。",
    accentColor: "#f472b6",
    features: [
      { label: "ゴミ出しリマインダー", included: true },
      { label: "買い物リスト共有", included: true },
      { label: "位置情報共有", included: true },
      { label: "子供の予定管理", included: true },
    ],
  },
  {
    id: "couple",
    name: "カップル",
    badge: "Love",
    description: "二人の大切な時間と思い出を共有するためのテンプレート。",
    accentColor: "#ef4444",
    features: [
      { label: "デート調整", included: true },
      { label: "記念日カウントダウン", included: true },
      { label: "交換日記", included: true },
      { label: "アルバム共有", included: true },
    ],
  },
];

const CUSTOM_OPTIONS_WITH_DEFAULT: Array<
  CalendarWizardCustomOption & { defaultChecked?: boolean }
> = [
  // Generic
  {
    id: "reminder_digest",
    label: "リマインダーサマリ",
    description: "翌日の予定を毎晩通知します。",
    category: "general",
    defaultChecked: true,
  },
  {
    id: "weather_forecast",
    label: "天気予報連携",
    description: "カレンダーに週間天気予報を表示します。",
    category: "general",
  },

  // Engineer
  {
    id: "git_integration",
    label: "Git連携",
    description: "GitHub/GitLabのコミット・PRをカレンダーに表示。",
    category: "engineer",
  },
  {
    id: "pull_request_review_wait_count",
    label: "PRレビュー待ち件数",
    description: "自分のレビュー待ちPR数を表示します。",
    category: "engineer",
  },
  {
    id: "team_review_load",
    label: "チームレビュー負荷",
    description: "チーム全体のレビュー状況を可視化します。",
    category: "engineer",
  },
  {
    id: "github_issues",
    label: "Issue期限管理",
    description: "担当Issueの期限をカレンダーに表示します。",
    category: "engineer",
  },
  {
    id: "sprint_management",
    label: "スプリント管理",
    description: "スプリントの開始・終了をカレンダーで管理。",
    category: "engineer",
  },
  {
    id: "release_notification",
    label: "リリース通知",
    description: "リリース予定日をチームに通知します。",
    category: "engineer",
  },
  {
    id: "milestone_progress",
    label: "マイルストーン進捗",
    description:
      "GitHub連携により、マイルストーンの進捗状況をプレビューに表示します。",
    category: "engineer",
  },

  // Family
  {
    id: "garbage_reminder",
    label: "ゴミ出し通知",
    description: "燃えるゴミ・資源ゴミの日を前日に通知。",
    category: "family",
  },
  {
    id: "shopping_list",
    label: "買い物リスト",
    description: "切らした食材や日用品を家族で共有。",
    category: "family",
  },
  {
    id: "kids_pickup",
    label: "送迎分担",
    description: "保育園や習い事の送迎担当を管理。",
    category: "family",
  },
  {
    id: "location_sharing",
    label: "位置情報共有",
    description: "家族の現在地をリアルタイムで共有。",
    category: "family",
  },
  {
    id: "kids_schedule",
    label: "子供の予定管理",
    description: "子供の学校行事や習い事を一元管理。",
    category: "family",
  },

  // Couple
  {
    id: "anniversary_countdown",
    label: "記念日カウント",
    description: "付き合ってからの日数を表示します。",
    category: "couple",
  },
  {
    id: "date_suggestion",
    label: "デートプラン提案",
    description: "週末のデートスポットをAIが提案。",
    category: "couple",
  },
  {
    id: "exchange_diary",
    label: "交換日記",
    description: "1日1言、お互いへのメッセージを記録。",
    category: "couple",
  },
  {
    id: "album_sharing",
    label: "アルバム共有",
    description: "二人の写真を共有アルバムで管理。",
    category: "couple",
  },
];

const CUSTOM_OPTION_ITEMS: CalendarWizardCustomOption[] =
  CUSTOM_OPTIONS_WITH_DEFAULT.map(({ defaultChecked, ...rest }) => rest);

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
  useSolo: false,
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
    setState((prev) => ({
      ...prev,
      selectedTemplateId: templateId,
    }));
  };

  const handleToggleCustomOption = (optionId: string) => {
    setState((prev) => ({
      ...prev,
      customOptions: {
        ...prev.customOptions,
        [optionId]: !prev.customOptions[optionId],
      },
    }));
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
      // モックサービスワーカーを起動
      if (typeof window !== "undefined") {
        console.log("[CalendarCreationWizard] Starting MSW...");
        await startMockServiceWorker();
        // MSWが完全に起動するまで少し待機
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("[CalendarCreationWizard] MSW started");
      }

      const payload: CreateCalendarRequest = {
        name: state.name.trim(),
        color: state.color,
        members: state.useSolo
          ? []
          : state.members
              .map((member) => member.email.trim())
              .filter((email) => email.length > 0),
        options: Object.entries(state.customOptions)
          .filter(([, enabled]) => enabled)
          .map(([key]) => key),
        imageId: state.imageId,
      };

      console.log(
        "[CalendarCreationWizard] Calling POST /api/calendars",
        payload,
      );
      await createCalendar(payload);
      setIsSubmitting(false);
      setIsComplete(true);
      toast.success("カレンダーを作成しました");
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage =
        error instanceof ApiClientError
          ? error.message
          : "カレンダーの作成に失敗しました";
      toast.error(errorMessage);
      console.error("Failed to create calendar:", error);
    }
  };

  const handleConfirmSubmit = () => {
    setIsConfirmModalOpen(true);
  };

  // 小さな固定配列の検索なのでメモ化不要
  const selectedTemplate = TEMPLATE_OPTIONS.find(
    (item) => item.id === state.selectedTemplateId,
  );

  // 固定配列のフィルタリングなのでメモ化不要
  const activeCustomOptions = CUSTOM_OPTIONS_WITH_DEFAULT.filter(
    (option) => state.customOptions[option.id],
  ).map(({ id, label }) => ({ id, label }));

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
              onClick={() => router.push("/?refresh=true")}
            >
              ダッシュボードに戻る
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CalendarWizardStepIndicator steps={STEPS} currentIndex={step} />
      <div className="space-y-6">
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
