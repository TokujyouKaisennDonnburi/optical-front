import { apiGet, apiPost } from "@/lib/api-client";
import type {
  ChangeReviewerRequest,
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

export async function getGitHubReviewOptions() {
  return apiGet<GitHubReviewOptionsResponse>("/api/github/review-options");
}

export async function changeGitHubReviewer(payload: ChangeReviewerRequest) {
  return apiPost("/api/github/change-reviewer", payload);
}

export async function getMilestoneProgress() {
  return apiGet<MilestoneProgressResponse>("/api/github/milestone-progress");
}
