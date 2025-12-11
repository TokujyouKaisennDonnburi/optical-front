import { apiGet, apiPost, OPTICAL_API_URL } from "@/lib/api-client";
import type {
  ChangeReviewerRequest,
  GitHubReviewOptionsResponse,
  GithubOauthRequest,
} from "@/types/github";

export async function postGithubOauth(payload: GithubOauthRequest) {
  return apiPost("/auth/github/link", payload, undefined, OPTICAL_API_URL);
}

export async function getGitHubReviewOptions() {
  return apiGet<GitHubReviewOptionsResponse>("/api/github/review-options");
}

export async function changeGitHubReviewer(payload: ChangeReviewerRequest) {
  return apiPost("/api/github/change-reviewer", payload);
}
