import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { SchedulerCard } from "@/components/molecules/SchedulerCard/SchedulerCard";
import type { SchedulerPollResponse } from "@/types/scheduler-poll";

type Props = {
  onCreate: () => void;
  schedulers: SchedulerPollResponse[];
  onSelectPoll: (id: string, hasResponded: boolean) => void;
};

export function SchedulerList({ onCreate, schedulers, onSelectPoll }: Props) {
  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">スケジューラー一覧</CardTitle>
        <CardDescription>
          メンバーの予定を確認して、日程を調整しましょう。
        </CardDescription>
      </CardHeader>

      <CardContent>
        {schedulers.length === 0 && (
          <CardDescription>
            まだスケジューラーがありません。新規作成してください。
          </CardDescription>
        )}
        <div className="mb-4">
          <Button
            onClick={onCreate}
            className="rounded-xl px-3 py-2 border text-sm"
          >
            新規作成
          </Button>
        </div>

        <div className="flex flex-col space-y-4">
          {schedulers.map((s) => (
            <SchedulerCard
              key={s.id}
              id={s.id}
              title={s.title}
              description={s.memo}
              createdAt={s.createdAt}
              respondersCount={s.respondersCount}
              hasResponded={s.hasResponded}
              limitTime={s.limitTime}
              onClick={onSelectPoll}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
