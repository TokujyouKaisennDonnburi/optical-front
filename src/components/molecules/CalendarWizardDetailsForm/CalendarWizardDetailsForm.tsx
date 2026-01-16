"use client";

import { FileImage, UploadCloud } from "lucide-react";
import Image from "next/image";
import type { ChangeEvent, DragEvent, RefObject } from "react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { SelectCalendarCard } from "@/components/molecules/SelectCalendarCard";
import { cn } from "@/utils_constants_styles/utils";

export type CalendarWizardDetailsFormProps = {
  name: string;
  color: string;
  colorOptions: string[];
  imagePreviewUrl: string | null;
  imageError: string | null;
  onNameChange: (value: string) => void;
  onSelectColor: (color: string) => void;
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  imageInputRef: RefObject<HTMLInputElement | null>;
};

export function CalendarWizardDetailsForm({
  name,
  color,
  colorOptions,
  imagePreviewUrl,
  imageError,
  onNameChange,
  onSelectColor,
  onImageChange,
  onRemoveImage,
  imageInputRef,
}: CalendarWizardDetailsFormProps) {
  const handleOpenImageDialog = () => {
    imageInputRef.current?.click();
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer?.files;
    if (!droppedFiles || droppedFiles.length === 0) {
      return;
    }
    const file = droppedFiles[0];
    if (!imageInputRef.current || typeof DataTransfer === "undefined") {
      return;
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);

    const input = imageInputRef.current as HTMLInputElement & {
      files: FileList | null;
    };
    input.files = dataTransfer.files;

    onImageChange({
      target: input,
      currentTarget: input,
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  const trimmedName = name.trim();
  const previewCalendar = {
    id: "preview-calendar",
    name: trimmedName || "新しいカレンダー",
    color,
    description: imagePreviewUrl
      ? "カバー画像が設定されました"
      : "カラーのみでプレビュー中 (画像は任意です)",
    imageUrl: imagePreviewUrl ?? undefined,
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_340px] items-start h-full">
      {/* Left Column: Inputs */}
      <div className="space-y-7 pt-6">
        {/* Name Input */}
        <div className="space-y-3">
          <label
            htmlFor="calendar-name"
            className="text-base font-semibold text-foreground flex items-center gap-2"
          >
            カレンダー名
            <span className="text-[10px] font-normal text-muted-foreground bg-muted cx-2 py-0.5 rounded px-1.5">
              必須
            </span>
          </label>
          <Input
            id="calendar-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="例: プロジェクトA, 旅行の計画"
            className="h-11 text-base px-4 border-muted-foreground/20 focus-visible:border-primary focus-visible:ring-primary/20 bg-background"
            autoFocus
          />
        </div>

        {/* Color Picker */}
        <div className="space-y-3">
          <p className="text-base font-semibold text-foreground">
            テーマカラー
          </p>
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap gap-3">
              {colorOptions.map((option) => {
                const isActive = option === color;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onSelectColor(option)}
                    className={cn(
                      "group relative h-9 w-9 rounded-full transition-all duration-200 outline-none",
                      isActive
                        ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-110 hover:shadow-md",
                    )}
                    aria-label={`色 ${option}`}
                  >
                    <span
                      className="absolute inset-0 rounded-full border border-black/5 dark:border-white/10"
                      style={{ backgroundColor: option }}
                    />
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-2.5 w-2.5 rounded-full bg-white shadow-sm" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label
            id="calendar-image-label"
            htmlFor="calendar-image"
            className="text-base font-semibold text-foreground flex items-center justify-between"
          >
            <span>カバー画像</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              任意 (PNG / JPG)
            </span>
          </label>

          <input
            id="calendar-image"
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={onImageChange}
            className="sr-only"
            aria-describedby="calendar-image-hint"
          />

          <div
            className={cn(
              "group relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200",
              imagePreviewUrl
                ? "border-primary/20 bg-background"
                : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50 hover:bg-primary/5",
            )}
          >
            <button
              type="button"
              onClick={handleOpenImageDialog}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className="relative w-full h-65 flex flex-col items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              aria-labelledby="calendar-image-label"
            >
              {imagePreviewUrl ? (
                <>
                  <Image
                    src={imagePreviewUrl}
                    alt="プレビュー"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white">
                    <FileImage className="w-8 h-8 mb-2" />
                    <span className="font-medium">画像を変更する</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 p-6 text-muted-foreground">
                  <div className="p-3 rounded-full bg-background shadow-sm border border-border group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-medium text-foreground">
                      クリックして画像を選択
                    </p>
                    <p className="text-xs">またはここにファイルをドロップ</p>
                  </div>
                </div>
              )}
            </button>

            {/* Image Actions (Only when image exists) */}
            {imagePreviewUrl && (
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="h-8 px-2 shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage();
                  }}
                >
                  削除
                </Button>
              </div>
            )}
          </div>

          {imageError && (
            <p className="text-sm font-medium text-destructive flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-destructive" />
              {imageError}
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Preview */}
      <div className="hidden lg:block sticky top-0 pt-1 space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              プレビュー
            </h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              Live
            </span>
          </div>

          <div className="p-1 rounded-xl border border-border bg-card/50 shadow-sm">
            <SelectCalendarCard
              calendar={previewCalendar}
              className="w-full shadow-md pointer-events-none"
            />
          </div>

          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-600 dark:text-blue-300">
            <p className="leading-relaxed">
              ダッシュボードでの表示イメージです。
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="lg:hidden space-y-3 mt-6 pt-6 border-t border-border">
        <p className="text-sm font-medium text-muted-foreground">プレビュー</p>
        <SelectCalendarCard
          calendar={previewCalendar}
          className="w-full opacity-90 pointer-events-none"
        />
      </div>
    </section>
  );
}
