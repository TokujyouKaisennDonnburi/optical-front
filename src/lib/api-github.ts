import { apiGet, apiPost } from "@/lib/api-client";
import type {
  GitHubAccountLinkedResponse,
  GitHubOrganizationLinkedResponse,
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
 */
export async function getMilestoneProgress(
  calendarId: string,
): Promise<MilestoneProgressResponse> {
  return apiGet<MilestoneProgressResponse>(
    `/github/calendars/${calendarId}/milestones`,
  );
}

// ==================== GitHub連携ステータス API ====================

/**
 * GitHubアカウント連携状態を取得
 * GET /api/github/account/linked
 *
 * TODO: バックエンド実装後に実APIに切り替え
 */
export async function getGitHubAccountLinked(): Promise<GitHubAccountLinkedResponse> {
  // モック: 未連携状態を返す（開発用）
  // 本番では apiGet<GitHubAccountLinkedResponse>("/github/account/linked") を使用
  return Promise.resolve({
    linked: false,
  });
}

/**
 * GitHub組織連携状態を取得
 * GET /api/github/organization/linked?calendarId={id}
 *
 * TODO: バックエンド実装後に実APIに切り替え
 */
export async function getGitHubOrganizationLinked(
  calendarId: string,
): Promise<GitHubOrganizationLinkedResponse> {
  // モック: 未連携状態を返す（開発用）
  // 本番では apiGet<GitHubOrganizationLinkedResponse>(`/github/organization/linked?calendarId=${calendarId}`) を使用
  console.log("[Mock] getGitHubOrganizationLinked called for:", calendarId);
  return Promise.resolve({
    linked: false,
  });
}

/**
 * GitHubアカウント連携を開始（OAuth URL取得）
 *
 * TODO: バックエンド実装後に実APIに切り替え
 */
export async function connectGitHubAccount(): Promise<{ oauthUrl: string }> {
  // モック: ダミーURLを返す
  return Promise.resolve({
    oauthUrl: "https://github.com/login/oauth/authorize?client_id=MOCK",
  });
}

/**
 * GitHub組織を連携（GitHub App インストールフロー）
 *
 * TODO: バックエンド実装後に実APIに切り替え
 */
export async function startGitHubAppInstall(
  calendarId: string,
): Promise<{ installUrl: string }> {
  // TODO: 本番では apiPost<{ installUrl: string }>("/github/apps/install/start", { calendarId }) を使用
  console.log("[Mock] startGitHubAppInstall called for:", calendarId);

  // モック: GitHub App インストールURLを返す
  // 実際のURLはバックエンドから取得する（state にcalendarIdを含む）
  return Promise.resolve({
    installUrl: `https://github.com/apps/optical-app/installations/new?state=${calendarId}`,
  });
}
