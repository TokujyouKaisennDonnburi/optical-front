import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Separator } from "@/components/atoms/Separator";
import { getReviewLoads } from "@/lib/api-github";
import type {
  GitHubReviewLoadResponse,
  TeamReviewLoadOptionProps,
} from "@/types/github";
import { MemberLoadItem } from "./MemberLoadItem";

export function TeamReviewLoadOption({
  calendarId,
  onReviewerChange,
}: TeamReviewLoadOptionProps) {
  const [reviewLoads, setReviewLoads] = useState<GitHubReviewLoadResponse[]>(
    [],
  );
  useEffect(() => {
    const fetch = async () => {
      const data: GitHubReviewLoadResponse[] = await getReviewLoads(calendarId);
      setReviewLoads(data);
    };
    fetch();
  }, [calendarId]);
  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">チームレビュー負荷</CardTitle>
        <CardDescription>
          GitHub のレビュー待ち PR 件数と負荷をチームで比較できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewLoads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            レビュー待ちはありません。
          </p>
        ) : (
          reviewLoads.map((reviewLoad) =>
            reviewLoad.reviewers.map((reviewer, index) => (
              <div key={reviewer.githubId} className="space-y-2">
                <MemberLoadItem
                  member={reviewer}
                  onReviewerChange={onReviewerChange}
                />
                {index < reviewLoads.length - 1 && (
                  <Separator className="bg-border" />
                )}
              </div>
            )),
          )
        )}
      </CardContent>
    </Card>
  );
}
