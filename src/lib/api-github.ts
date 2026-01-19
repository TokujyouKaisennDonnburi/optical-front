import { apiGet, apiPost } from "@/lib/api-client";
import type {
  GitHubAccountLinkedStatus,
  GitHubAppInstallationStatus,
  GitHubReviewLoadResponse,
  GitHubReviewRequestResponse,
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
export async function getReviewRequests(
  calendarId: string,
): Promise<GitHubReviewRequestResponse[]> {
  return apiPost<GitHubReviewRequestResponse[]>(
    `/github/calendars/${calendarId}/review-requests`,
  );
}

export async function getReviewLoads(
  calendarId: string,
): Promise<GitHubReviewLoadResponse[]> {
  return apiGet<GitHubReviewLoadResponse[]>(
    `/github/calendars/${calendarId}/review-load-status`,
  );
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
 * GET /github/oauth/status
 */
export async function getGitHubAccountStatus(): Promise<GitHubAccountLinkedStatus> {
  return apiGet<GitHubAccountLinkedStatus>("/github/oauth/status");
}

/**
 * GitHub組織連携状態（インストール状態）を取得
 * GET /github/calendars/{calendarId}/installation-status
 */
export async function getGitHubInstallationStatus(
  calendarId: string,
): Promise<GitHubAppInstallationStatus> {
  return apiGet<GitHubAppInstallationStatus>(
    `/github/calendars/${calendarId}/installation-status`,
  );
}

/**
 * GitHubアカウント連携を開始（OAuth URL取得）
 *
 * POST /github/oauth/state
 */
export async function connectGitHubAccount(): Promise<{ url: string }> {
  return apiPost<{ url: string }>("/github/oauth/state");
}

/**
 * GitHub組織を連携（GitHub App インストールフロー）
 *
 * POST /github/apps/state
 */
export async function startGitHubAppInstall(
  calendarId: string,
): Promise<{ url: string }> {
  return apiPost<{ url: string }>("/github/apps/state", { calendarId });
}
