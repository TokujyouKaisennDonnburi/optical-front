import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Skeleton } from "@/components/atoms/Skeleton";
import { MilestoneProgress } from "@/components/organisms/EngineerOption/MilestoneProgressOption/MilestoneProgress";
import { getMilestoneProgress } from "@/lib/api-github";
import { startMockServiceWorker } from "@/mocks/browser";
import type { Milestone } from "@/types/github";

const skeletonItems = [{ id: 1 }, { id: 2 }, { id: 3 }];

export function MilestoneProgressOption() {
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setIsLoading(true);
        const data = await getMilestoneProgress();
        setMilestones(data.milestones);
      } catch (err) {
        setError("マイルストーンの取得に失敗しました。");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchMilestones();
  }, []);

  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">マイルストーン進捗</CardTitle>
        <CardDescription>現在アクティブなマイルストーン</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          // ローディング中のスケルトン表示
          skeletonItems.map((item) => (
            <div key={item.id} className="space-y-3 pt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : milestones && milestones.length > 0 ? (
          // 取得したマイルストーンを縦に並べて表示
          milestones.map((milestone) => (
            <MilestoneProgress
              key={milestone.name}
              openIssues={milestone.openIssues}
              closedIssues={milestone.closedIssues}
              name={milestone.name}
              url={milestone.url}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">
            アクティブなマイルストーンはありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default MilestoneProgressOption;
