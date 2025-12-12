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

  const isInlinePreview =
    typeof imagePreviewUrl === "string" &&
    (imagePreviewUrl.startsWith("data:") ||
      imagePreviewUrl.startsWith("blob:"));

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="calendar-name"
            className="text-sm font-medium text-foreground"
          >
            カレンダー名
          </label>
          <Input
            id="calendar-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="名前を追加"
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            カレンダーカラー
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((option) => {
              const isActive = option === color;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectColor(option)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition",
                    isActive
                      ? "border-primary shadow focus-visible:ring-2 focus-visible:ring-offset-2"
                      : "border-transparent hover:-translate-y-0.5",
                  )}
                  style={{ backgroundColor: option }}
                  aria-label={`色 ${option}`}
                >
                  <span className="sr-only">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="space-y-3">
          <label
            id="calendar-image-label"
            htmlFor="calendar-image"
            className="text-sm font-medium text-foreground"
          >
            カバー画像 (任意 / PNG・JPG)
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(13.75rem,17.5rem)] lg:items-start">
            <div className="flex flex-col gap-3">
              <div
                className={cn(
                  "relative flex min-h-[13.75rem] w-full overflow-hidden rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/20 text-center transition hover:border-primary/70 hover:bg-primary/5",
                  imagePreviewUrl ? "border-primary/60 bg-background" : "",
                )}
              >
                <button
                  type="button"
                  onClick={handleOpenImageDialog}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className={cn(
                    "group relative flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    imagePreviewUrl ? "p-0" : "",
                  )}
                  aria-labelledby="calendar-image-label"
                  aria-describedby="calendar-image-hint"
                >
                  {imagePreviewUrl ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center bg-background">
                        <Image
                          src={imagePreviewUrl}
                          alt="選択したカバー画像のプレビュー"
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, 768px"
                          unoptimized={isInlinePreview}
                        />
                      </div>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-gradient-to-t from-background/90 via-background/60 to-transparent px-4 pb-4 pt-8 text-sm text-muted-foreground transition opacity-0 group-hover:opacity-100">
                        <FileImage
                          className="h-5 w-5 text-primary"
                          aria-hidden
                        />
                        <p className="font-medium text-foreground">
                          クリックして差し替え
                        </p>
                        <p id="calendar-image-hint" className="text-xs">
                          任意 / PNG・JPG、推奨サイズ 1200×630px
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <UploadCloud
                        className="h-10 w-10 text-muted-foreground"
                        aria-hidden
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          任意: クリックまたはドロップでアップロード
                        </p>
                        <p
                          id="calendar-image-hint"
                          className="text-xs text-muted-foreground"
                        >
                          任意 / PNG・JPG、推奨サイズ 1200×630px
                        </p>
                      </div>
                      <Button asChild size="sm" variant="secondary">
                        <span>画像を選択</span>
                      </Button>
                    </>
                  )}
                </button>
                {imagePreviewUrl ? (
                  <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-2 p-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="pointer-events-auto"
                      onClick={handleOpenImageDialog}
                    >
                      別の画像を選ぶ
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="pointer-events-auto"
                      onClick={onRemoveImage}
                    >
                      画像をクリア
                    </Button>
                  </div>
                ) : null}
              </div>
              {imageError ? (
                <p className="text-sm text-destructive">{imageError}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                プレビュー
              </p>
              <SelectCalendarCard
                calendar={previewCalendar}
                className={cn(
                  "pointer-events-none select-none opacity-95",
                  imagePreviewUrl ? "" : "opacity-80",
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
