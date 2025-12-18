import { apiPost } from "@/lib/api-client";
import type {
  GitHubReviewOptionsResponse,
  GithubAppInstallRequest,
  GithubOauthRequest,
  MilestoneProgressResponse,
} from "@/types/github";

export async function postGithubOauth(payload: GithubOauthRequest) {
  return apiPost("/github/oauth/link", payload);
}

export async function postGithubAppInstall(payload: GithubAppInstallRequest) {
  return apiPost("/github/apps/install", payload);
}

/**
 * GitHub レビューオプション情報を取得
 * TODO: バックエンドは POST /github/calendars/{calendarId}/review-requests を使用
 * 現在はフロント側でモックデータを返す
 */
export async function getGitHubReviewOptions(): Promise<GitHubReviewOptionsResponse> {
  // バックエンド未実装のため、モックデータを返す
  return Promise.resolve({
    myPendingReviews: [],
    teamReviewLoads: [],
    allPullRequestsUrl: "",
  });
}

/**
 * マイルストーン進捗を取得
 * TODO: バックエンドは GET /github/calendars/{calendarId}/review-load-status を使用
 * 現在はフロント側でモックデータを返す
 */
export async function getMilestoneProgress(): Promise<MilestoneProgressResponse> {
  // バックエンド未実装のため、モックデータを返す
  return Promise.resolve({
    milestones: [],
  });
}
