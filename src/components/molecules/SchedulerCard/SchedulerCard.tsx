import { format } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import type { SchedulerCardProps } from "@/types/scheduler";

export const SchedulerCard: React.FC<SchedulerCardProps> = ({
  id,
  title,
  description,
  limitTime,
  respondersCount,
  hasResponded,
  onClick,
}) => {
  const formattedLimitTime = limitTime
    ? format(new Date(limitTime), "yyyy/MM/dd HH:mm", { locale: ja })
    : undefined;

  return (
    <Card>
      <CardHeader
        className="space-y-1 pb-3"
        onClick={() => onClick?.(id, hasResponded)}
      >
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {formattedLimitTime && <p>回答期限: {formattedLimitTime}</p>}
          {description && <p>{description}</p>}
          <p>回答者数: {respondersCount}</p>
        </div>
      </CardHeader>
    </Card>
  );
};
