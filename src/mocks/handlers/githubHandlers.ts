/**
 * GitHub API のモックハンドラー
 */

import { HttpResponse, http } from "msw";
import type { GitHubReviewOptionsResponse } from "@/types/github";
import {
  mockAllPrsUrl,
  mockPullRequests,
  mockTeamMembers,
} from "../data/github";

const API_PREFIX = "http://localhost:8000";

/**
 * GitHub ハンドラー
 */
export const githubHandlers = [
  /**
   * GET /api/github/review-options
   * GitHub レビューオプション情報を取得
   */
  http.get(`${API_PREFIX}/api/github/review-options`, async () => {
    // 少し遅延を追加してリアルな感じにする
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response: GitHubReviewOptionsResponse = {
      myPendingReviews: mockPullRequests,
      teamReviewLoads: mockTeamMembers,
      allPullRequestsUrl: mockAllPrsUrl,
    };

    return HttpResponse.json(response, { status: 200 });
  }),

  /**
   * GET /api/github/pull-requests
   * レビュー待ち PR 一覧を取得
   */
  http.get(`${API_PREFIX}/api/github/pull-requests`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json(
      {
        pullRequests: mockPullRequests,
        allPrsUrl: mockAllPrsUrl,
      },
      { status: 200 },
    );
  }),

  /**
   * GET /api/github/team-review-loads
   * チームメンバーのレビュー負荷を取得
   */
  http.get(`${API_PREFIX}/api/github/team-review-loads`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json(
      {
        members: mockTeamMembers,
      },
      { status: 200 },
    );
  }),

  /**
   * POST /api/github/change-reviewer
   * レビュアーを変更
   */
  http.post(`${API_PREFIX}/api/github/change-reviewer`, async ({ request }) => {
    const body = await request.json();

    // バリデーション
    if (!body || typeof body !== "object") {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "リクエストボディが不正です",
          },
        },
        { status: 400 },
      );
    }

    const { pullRequestId, newReviewerUsername } = body as {
      pullRequestId?: number;
      newReviewerUsername?: string;
    };

    if (!pullRequestId || !newReviewerUsername) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "pullRequestId と newReviewerUsername は必須です",
          },
        },
        { status: 400 },
      );
    }

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 500));

    // モックなので成功レスポンスを返す
    return HttpResponse.json(
      {
        success: true,
        message: `PR #${pullRequestId} のレビュアーを ${newReviewerUsername} に変更しました`,
      },
      { status: 200 },
    );
  }),

  /**
   * GET /api/github/milestone-progress
   * マイルストーンの進捗を取得
   */
  http.get(`${API_PREFIX}/api/github/milestone-progress`, async () => {
    // 遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 400));

    return HttpResponse.json(
      {
        milestones: [
          {
            name: "2025 Q1 Sprint",
            openIssues: 8,
            closedIssues: 22,
            url: "https://github.com/mock/repo/milestones/1",
          },
          {
            name: "2025 Q2 Infrastructure",
            openIssues: 2,
            closedIssues: 10,
            url: "https://github.com/mock/repo/milestones/2",
          },
          {
            name: "2025 Q2 New Features",
            openIssues: 15,
            closedIssues: 5,
            url: "https://github.com/mock/repo/milestones/3",
          },
        ],
      },
      { status: 200 },
    );
  }),
];
