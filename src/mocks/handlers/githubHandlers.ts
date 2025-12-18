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
 * バックエンドに実装されているAPIのみをモック
 */
export const githubHandlers = [
  /**
   * POST /github/apps/install
   * GitHub Apps インストール
   */
  http.post(`${API_PREFIX}/github/apps/install`, async ({ request }) => {
    const body = (await request.json()) as {
      installationId: number;
      calendarId: string;
    };

    // バリデーション
    if (!body.installationId || !body.calendarId) {
      return HttpResponse.json(
        {
          error: {
            code: 400,
            message: "installationId と calendarId は必須です",
          },
        },
        { status: 400 },
      );
    }

    // 少し遅延を追加
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  /**
   * POST /github/apps/state
   * GitHub Apps 状態作成
   */
  http.post(`${API_PREFIX}/github/apps/state`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockState = `apps-state-${Date.now()}`;
    return HttpResponse.json({ state: mockState }, { status: 200 });
  }),

  /**
   * POST /github/oauth/state
   * GitHub OAuth 状態作成
   */
  http.post(`${API_PREFIX}/github/oauth/state`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const mockState = `oauth-state-${Date.now()}`;
    return HttpResponse.json({ state: mockState }, { status: 200 });
  }),

  /**
   * POST /github/calendars/:calendarId/review-requests
   * レビューリクエスト取得（保護ルート）
   */
  http.post(
    `${API_PREFIX}/github/calendars/:calendarId/review-requests`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const response: GitHubReviewOptionsResponse = {
        myPendingReviews: mockPullRequests,
        teamReviewLoads: mockTeamMembers,
        allPullRequestsUrl: mockAllPrsUrl,
      };

      return HttpResponse.json(response, { status: 200 });
    },
  ),

  /**
   * GET /github/calendars/:calendarId/review-load-status
   * レビュー読み込み状態
   */
  http.get(
    `${API_PREFIX}/github/calendars/:calendarId/review-load-status`,
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      return HttpResponse.json(
        {
          members: mockTeamMembers,
        },
        { status: 200 },
      );
    },
  ),
];
