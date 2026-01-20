"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Label } from "@/components/atoms/Label";
import { Skeleton } from "@/components/atoms/Skeleton";
import { Text } from "@/components/atoms/Text";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/atoms/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSchedulerPoll } from "@/lib/api-scheduler-polls";
import type { SchedulerPollDetailResponse } from "@/types/scheduler-poll";
import { cn } from "@/utils_constants_styles/utils";

type Props = {
  schedulerId: string;
  onBack: () => void;
  onConfirm: (data: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
};

const statusToIcon = {
  ok: "◯",
  maybe: "△",
  ng: "×",
};

const statusToColor = {
  ok: "text-green-500",
  maybe: "text-yellow-500",
  ng: "text-red-500",
};

const formatDateToJP = (dateString: string) => {
  return dateString.replace(/-/g, "/");
};

type SummaryCount = {
  date: string;
  ok: number;
  maybe: number;
  ng: number;
};

function getBestDates(summaryCounts: SummaryCount[]): string[] {
  let bestDates: string[] = [];
  let maxOk = -1;
  let maxMaybeForMaxOk = -1;

  for (const summary of summaryCounts) {
    const { date, ok, maybe } = summary;

    if (ok > maxOk) {
      maxOk = ok;
      maxMaybeForMaxOk = maybe;
      bestDates = [date];
    } else if (ok === maxOk) {
      if (maybe > maxMaybeForMaxOk) {
        maxMaybeForMaxOk = maybe;
        bestDates = [date];
      } else if (maybe === maxMaybeForMaxOk) {
        bestDates.push(date);
      }
    }
  }
  return bestDates;
}

export function SchedulerSummary({ schedulerId, onBack, onConfirm }: Props) {
  const [poll, setPoll] = useState<SchedulerPollDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFinalDate, setSelectedFinalDate] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      try {
        const data = await getSchedulerPoll(schedulerId);
        setPoll(data);
      } catch (error) {
        toast.error("集計結果の読み込みに失敗しました。");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [schedulerId]);

  const summaryCounts = useMemo(() => {
    if (!poll) return [];
    return poll.dates.map((dateInfo) => {
      const counts = { ok: 0, maybe: 0, ng: 0 };
      poll.submissions.forEach((submission) => {
        const status = submission.availabilities[dateInfo.date];
        if (status) {
          counts[status]++;
        }
      });
      return { date: dateInfo.date, ...counts };
    });
  }, [poll]);

  const bestDates = useMemo(() => getBestDates(summaryCounts), [summaryCounts]);

  const handleConfirm = () => {
    if (!selectedFinalDate || !poll) return;
    const dateInfo = poll.dates.find((d) => d.date === selectedFinalDate);
    if (!dateInfo) return;

    const confirmationData = {
      title: poll.title,
      date: dateInfo.date,
      startTime: dateInfo.startTime,
      endTime: dateInfo.endTime,
    };
    onConfirm(confirmationData);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
          {/* ... other skeletons */}
        </CardContent>
      </Card>
    );
  }

  if (!poll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>エラー</CardTitle>
          <CardDescription>集計結果を読み込めませんでした。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onBack} className="w-full" variant="outline">
            戻る
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-stone-300 bg-stone-50 dark:border-slate-700 dark:bg-slate-900">
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base text-stone-900 dark:text-slate-50">
          {poll.title}
        </CardTitle>
        <CardDescription className="text-stone-600 dark:text-slate-400">
          {poll.memo}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          onValueChange={setSelectedFinalDate}
          value={selectedFinalDate || ""}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead className="w-[150px]">日程</TableHead>
                  <TableHead className="text-center text-green-500">
                    ◯
                  </TableHead>
                  <TableHead className="text-center text-yellow-500">
                    △
                  </TableHead>
                  <TableHead className="text-center text-red-500">×</TableHead>
                  {poll.submissions.map(({ user }) => (
                    <TableHead key={user.id} className="text-center">
                      {user.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {poll.dates.map((dateInfo) => {
                  const counts = summaryCounts.find(
                    (s) => s.date === dateInfo.date,
                  );
                  const isBestDate = bestDates.includes(dateInfo.date);
                  const id = `date-${dateInfo.date}`;
                  return (
                    <TableRow
                      key={dateInfo.date}
                      className={cn(
                        isBestDate && "border-l-4 border-green-500",
                      )}
                    >
                      <TableCell>
                        <RadioGroupItem value={dateInfo.date} id={id} />
                      </TableCell>
                      <TableCell className="w-[150px]">
                        <Label htmlFor={id} className="cursor-pointer">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Text size="sm">
                                {formatDateToJP(dateInfo.date)}
                              </Text>
                            </div>
                            <Text size="sm">
                              {dateInfo.startTime}~{dateInfo.endTime}
                            </Text>
                          </div>
                        </Label>
                      </TableCell>
                      <TableCell className="text-center font-bold text-green-500">
                        {counts?.ok}
                      </TableCell>
                      <TableCell className="text-center font-bold text-yellow-500">
                        {counts?.maybe}
                      </TableCell>
                      <TableCell className="text-center font-bold text-red-500">
                        {counts?.ng}
                      </TableCell>
                      {poll.submissions.map(({ user, availabilities }) => {
                        const availabilityStatus =
                          availabilities[dateInfo.date];
                        const colorClass =
                          statusToColor[availabilityStatus] ?? "";
                        const icon = statusToIcon[availabilityStatus] ?? "";
                        return (
                          <TableCell
                            key={user.id}
                            className={`text-center font-bold ${colorClass}`}
                          >
                            {icon}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </RadioGroup>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">コメント</h3>
          {poll.submissions.map(({ user, comment }) => (
            <div key={user.id} className="space-y-1">
              <Text size="sm" className="font-medium">
                {user.name}
              </Text>
              <div className="rounded-md border bg-muted p-3">
                {comment ? (
                  <Text size="sm" className="whitespace-pre-wrap">
                    {comment}
                  </Text>
                ) : (
                  <Text size="sm" className="text-gray-500">
                    コメントはありません。
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            onClick={handleConfirm}
            disabled={!selectedFinalDate}
            className="w-full"
          >
            日程を確定する
          </Button>
          <Button onClick={onBack} className="w-full" variant="outline">
            戻る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
