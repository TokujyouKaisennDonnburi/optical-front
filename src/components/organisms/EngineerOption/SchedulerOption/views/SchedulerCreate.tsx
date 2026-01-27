"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import { Switch } from "@/components/atoms/Switch";
import { Textarea } from "@/components/atoms/Textarea";

type BackendDate = {
  date: string;
  startTime: string;
  endTime: string;
};

// A helper type for the initial data
export type SchedulerCreateData = {
  title: string;
  memo: string;
  limitTime: string | null;
  isAllDay: boolean;
  dates: BackendDate[];
  defaultStartTime: string;
  defaultEndTime: string;
};

type Props = {
  onBack: () => void;
  onNext: (data: SchedulerCreateData) => void;
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
  initialData?: Partial<SchedulerCreateData> | null;
};

export function SchedulerCreate({
  onBack,
  onNext,
  selectedDates,
  setSelectedDates,
  initialData,
}: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [memo, setMemo] = useState(initialData?.memo || "");
  // datetime-local input needs a specific format `YYYY-MM-DDTHH:mm`
  const [limit, setLimit] = useState(
    initialData?.limitTime
      ? new Date(initialData.limitTime).toISOString().slice(0, 16)
      : "",
  );
  const [isAllDay, setIsAllDay] = useState(initialData?.isAllDay ?? true);
  const [defaultStartTime, setDefaultStartTime] = useState(
    initialData?.defaultStartTime || "",
  );
  const [defaultEndTime, setDefaultEndTime] = useState(
    initialData?.defaultEndTime || "",
  );

  const handleAllDayChange = (checked: boolean) => {
    setIsAllDay(checked);
    if (checked) {
      setDefaultStartTime("");
      setDefaultEndTime("");
    }
  };

  // yyyy-MM-dd + HH:mm → ISO (UTC)
  const toISO = (date: string, time: string) => {
    return new Date(`${date}T${time}:00Z`).toISOString();
  };

  // 終日データ生成
  const buildAllDay = (date: string): BackendDate => ({
    date: new Date(`${date}T00:00:00Z`).toISOString(),
    startTime: new Date(`${date}T00:00:00Z`).toISOString(),
    endTime: new Date(`${date}T23:59:59Z`).toISOString(),
  });

  // 回答締切の変更ハンドラ
  // 「今日」ボタンを押した場合（日付だけ今日に変わり、時刻は変わらない）は23:59に設定
  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!newValue) {
      setLimit("");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newDate = newValue.slice(0, 10);
    const newTime = newValue.slice(11, 16);
    const oldDate = limit.slice(0, 10);
    const oldTime = limit.slice(11, 16);

    // 「今日」ボタン検知：日付が今日で、時刻が変わらない場合
    if (newDate === today && newTime === oldTime) {
      setLimit(`${today}T23:59`);
    } else {
      setLimit(newValue);
    }
  };

  // 開始変更 → 自動で +1時間
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDefaultStartTime(v);

    if (!v) {
      setDefaultEndTime("");
      return;
    }

    const [h, m] = v.split(":").map(Number);
    const d = new Date();
    d.setHours(h + 1, m, 0, 0);

    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    setDefaultEndTime(`${hh}:${mm}`);
  };

  const handleNext = () => {
    const backendDates: BackendDate[] = selectedDates.map((d) => {
      if (isAllDay) return buildAllDay(d);

      return {
        date: new Date(`${d}T00:00:00Z`).toISOString(),
        startTime: toISO(d, defaultStartTime),
        endTime: toISO(d, defaultEndTime),
      };
    });

    onNext({
      title,
      memo,
      limitTime: limit ? new Date(`${limit}:59Z`).toISOString() : null,
      isAllDay,
      dates: backendDates,
      defaultStartTime,
      defaultEndTime,
    });
  };

  const isTimeInputInvalid =
    !isAllDay && (!defaultStartTime || !defaultEndTime);

  const sortedSelectedDates = [...selectedDates].sort();

  const formatDateToJP = (dateString: string) => {
    return dateString.replace(/-/g, "/");
  };

  return (
    <Card className="border-stone-300 bg-stone-50 dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base text-stone-900 dark:text-slate-50">
          スケジューラーを新規作成
        </CardTitle>
        <CardDescription className="text-stone-600 dark:text-slate-400">
          候補日と共有内容を設定します。
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* タイトル */}
        <div className="space-y-1">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 開始/終了時刻 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="all-day">終日</Label>
            <Switch
              id="all-day"
              checked={isAllDay}
              onCheckedChange={handleAllDayChange}
            />
          </div>
          {!isAllDay && (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={defaultStartTime}
                onChange={handleStartTimeChange}
              />
              <span>〜</span>
              <Input
                type="time"
                value={defaultEndTime}
                onChange={(e) => setDefaultEndTime(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* 候補日一覧（縦並び、右端−削除） */}
        <div className="space-y-1">
          <Label>候補日</Label>

          <div className="rounded-lg border p-3 space-y-2">
            {selectedDates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                カレンダーから日付を選択してください
              </p>
            )}

            {sortedSelectedDates.map((d) => (
              <div
                key={d}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm">{formatDateToJP(d)}</span>
                  <span className="text-xs text-muted-foreground">
                    {isAllDay
                      ? "終日"
                      : `${defaultStartTime} 〜 ${defaultEndTime}`}
                  </span>
                </div>
                <Button
                  onClick={() =>
                    setSelectedDates(selectedDates.filter((x) => x !== d))
                  }
                  variant="ghost"
                  className="
                  text-red-500
                  hover:bg-red-500 hover:text-white
                  "
                >
                  -
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* 回答期限 */}
        <div className="space-y-1">
          <Label htmlFor="limit">回答締切</Label>
          <Input
            id="limit"
            type="datetime-local"
            value={limit}
            onChange={handleLimitChange}
          />
        </div>

        {/* メモ */}
        <div className="space-y-1">
          <Label htmlFor="memo">メモ</Label>
          <Textarea
            id="memo"
            rows={4}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={handleNext}
            className="w-full"
            disabled={
              !title || selectedDates.length === 0 || isTimeInputInvalid
            }
          >
            候補日時の回答に進む
          </Button>
          <Button variant="outline" className="w-full" onClick={onBack}>
            戻る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
