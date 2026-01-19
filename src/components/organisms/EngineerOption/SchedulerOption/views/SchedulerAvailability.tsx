import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Label } from "@/components/atoms/Label";
import { Textarea } from "@/components/atoms/Textarea";
import { AvailabilityRow } from "@/components/molecules/AvailabilityRow/AvailabilityRow";
import type { AvailabilityMap } from "../SchedulerOption";

type Props = {
  title: string;
  dates: string[];
  defaultStartTime?: string;
  defaultEndTime?: string;
  memo: string;
  availability: AvailabilityMap;
  onChange: (v: AvailabilityMap) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
};

export function SchedulerAvailability({
  title,
  dates,
  defaultStartTime,
  defaultEndTime,
  memo,
  availability,
  onChange,
  comment,
  onCommentChange,
  onNext,
  onBack,
}: Props) {
  const isNextDisabled = dates.some((date) => !availability[date]);
  const formatDateToJP = (dateString: string) => {
    return dateString.replace(/-/g, "/");
  };

  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{memo}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {dates.map((date) => (
            <AvailabilityRow
              key={date}
              date={formatDateToJP(date)}
              defaultStartTime={defaultStartTime}
              defaultEndTime={defaultEndTime}
              value={availability[date]}
              onChange={(v) =>
                onChange({
                  ...availability,
                  [date]: v,
                })
              }
            />
          ))}
        </div>

        <div className="space-y-2 pt-4">
          <Label htmlFor="comment">コメント</Label>
          <Textarea
            id="comment"
            placeholder="コメント（任意）"
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
          />
        </div>

        <div className="space-y-2 pt-4">
          <Button className="w-full" onClick={onNext} disabled={isNextDisabled}>
            決定
          </Button>
          <Button className="w-full" onClick={onBack} variant="outline">
            戻る
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
