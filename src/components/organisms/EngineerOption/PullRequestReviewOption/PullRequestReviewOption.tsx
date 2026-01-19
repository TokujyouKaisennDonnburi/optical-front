"use client";

import { Bell, ExternalLink, Flame } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/atoms/Badge";
import { getReviewRequests } from "@/lib/api-github";
import type {
  GitHubPullRequest,
  GitHubReviewRequestResponse,
  PullRequestReviewOptionProps,
} from "@/types/github";
import { cn } from "@/utils_constants_styles/utils";

/**
 * GitHub PR レビュー待ち件数を表示するオプションウィジェット
 *
 * ベルアイコンとバッジで未レビュー件数を示し、
 * PR の一覧を常時表示する。
 */
export function PullRequestReviewOption({
  calendarId,
  allPrsUrl,
  className,
}: PullRequestReviewOptionProps) {
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([]);
  useEffect(() => {
    const fetch = async () => {
      const data: GitHubReviewRequestResponse[] =
        await getReviewRequests(calendarId);
      const prList: GitHubPullRequest[] = data.map((pr) => {
        return {
          id: pr.id,
          number: pr.number,
          title: pr.title,
          url: pr.url,
          assignees: pr.assignees.map((assign) => {
            return {
              id: assign.githubId,
              name: assign.githubName,
              url: assign.githubUrl,
              assigned: assign.assigned,
            };
          }),
        };
      });
      setPullRequests(prList);
    };
    fetch();
  }, []);
  const [overflowStates, setOverflowStates] = useState<Map<number, boolean>>(
    new Map(),
  );
  const elementRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const updateOverflowStates = useCallback(() => {
    setOverflowStates((prev) => {
      const next = new Map<number, boolean>();
      elementRefs.current.forEach((element, prId) => {
        if (element) {
          const isOverflow = element.scrollWidth > element.clientWidth;
          next.set(prId, isOverflow);
        }
      });

      let changed = prev.size !== next.size;
      if (!changed) {
        for (const [key, value] of next) {
          if (prev.get(key) !== value) {
            changed = true;
            break;
          }
        }
      }

      return changed ? next : prev;
    });
  }, []);

  const registerElement = useCallback(
    (prId: number, element: HTMLDivElement | null) => {
      const previous = elementRefs.current.get(prId);
      if (previous && previous !== element) {
        resizeObserverRef.current?.unobserve(previous);
      }

      if (previous === element) {
        return;
      }

      if (!element) {
        elementRefs.current.delete(prId);
        updateOverflowStates();
        return;
      }

      elementRefs.current.set(prId, element);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.observe(element);
      }
      updateOverflowStates();
    },
    [updateOverflowStates],
  );

  /**
   * マウント後と依存値変更時にオーバーフロー判定を実行
   */
  useEffect(() => {
    updateOverflowStates();
  }, [updateOverflowStates]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    resizeObserverRef.current = new ResizeObserver(() =>
      updateOverflowStates(),
    );
    elementRefs.current.forEach((element) => {
      if (element) {
        resizeObserverRef.current?.observe(element);
      }
    });
    return () => {
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
    };
  }, [updateOverflowStates]);

  return (
    <div
      className={cn(
        "w-80 min-w-80 max-w-sm rounded-2xl border border-[#30363d] bg-[#0d1117] p-6 text-[#f0f6fc] shadow-2xl shadow-black/40",
        className,
      )}
    >
      {/* マーキーアニメーション用スタイル */}
      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .marquee-container.has-overflow:hover .marquee-text {
          animation: marquee-scroll 10s linear infinite;
        }
      `}</style>

      {/* ベルアイコンとバッジ */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          <Bell className="h-14 w-14 text-[#8b949e]" />
          {pullRequests.length > 0 && (
            <Badge
              variant="outline"
              className="absolute -top-2 -right-2 h-7 min-w-7 flex items-center justify-center rounded-full border-[#238636] bg-[#238636] p-0 text-sm font-bold text-white"
            >
              {pullRequests.length}
            </Badge>
          )}
        </div>
      </div>

      {/* PR 一覧 */}
      <div className="space-y-3">
        <div className="text-center font-semibold text-lg text-white">
          レビュー待ち ({pullRequests.length})
        </div>
        <div className="border-t border-[#30363d]" />

        {pullRequests.length === 0 ? (
          <div className="py-6 text-center text-sm text-[#8b949e]">
            レビュー待ちはありません
          </div>
        ) : (
          <ul
            className={cn(
              "space-y-2",
              pullRequests.length > 3 && "max-h-48 overflow-y-auto",
            )}
          >
            {pullRequests.map((pr) => (
              <li key={pr.id}>
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "marquee-container flex items-start gap-2 rounded-xl border border-transparent bg-[#161b22] p-3 transition-colors hover:border-[#30363d] hover:bg-[#1b1f26]",
                    overflowStates.get(pr.id) && "has-overflow",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="overflow-hidden max-w-[10rem]"
                        ref={(el) => registerElement(pr.id, el)}
                      >
                        <span className="marquee-text inline-block text-sm font-medium whitespace-nowrap text-white">
                          {pr.title}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#8b949e] mt-1">
                      <span className="text-[#2ea043] font-semibold">
                        #{pr.number}
                      </span>
                      {pr.assignees.length > 0 && (
                        <span>
                          by{" "}
                          <span className="text-[#79c0ff]">
                            @{pr.assignees[0].name}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-[#8b949e] mt-0.5" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {allPrsUrl && (
          <>
            <div className="border-t border-[#30363d]" />
            <a
              href={allPrsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-center text-sm font-semibold text-[#2ea043] hover:text-[#3fb950]"
            >
              (全てのPRを見る → GitHubへ)
            </a>
          </>
        )}
      </div>
    </div>
  );
}
