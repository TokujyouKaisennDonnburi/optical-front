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
    <Card className="border-stone-300 bg-white dark:border-slate-600 dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-900/50 transition-all duration-200 cursor-pointer dark:hover:bg-slate-700">
      <CardHeader
        className="space-y-1 pb-3"
        onClick={() => onClick?.(id, hasResponded)}
      >
        <CardTitle className="text-base text-stone-900 dark:text-slate-50">
          {title}
        </CardTitle>
        <div className="text-sm text-stone-600 dark:text-slate-400">
          {formattedLimitTime && <p>回答期限: {formattedLimitTime}</p>}
          {description && <p>{description}</p>}
          <p>回答者数: {respondersCount}</p>
        </div>
      </CardHeader>
    </Card>
  );
};
