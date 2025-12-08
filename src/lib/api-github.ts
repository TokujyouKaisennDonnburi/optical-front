import { apiGet, apiPost } from "@/lib/api-client";
import type {
  ChangeReviewerRequest,
  GitHubReviewOptionsResponse,
} from "@/types/github";

export async function getGitHubReviewOptions() {
  return apiGet<GitHubReviewOptionsResponse>("/api/github/review-options");
}

export async function changeGitHubReviewer(payload: ChangeReviewerRequest) {
  return apiPost("/api/github/change-reviewer", payload);
}
