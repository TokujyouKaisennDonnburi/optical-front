import type {
  GoogleCreateOauthStateResponse,
  GoogleCreateUserReponse,
  GoogleCreateUserRequest,
} from "@/types/google";
import { apiPost } from "./api-client";

export async function postGoogleOauth() {
  return apiPost<GoogleCreateOauthStateResponse>("/google/oauth/state");
}

export async function postGoogleCreateUser(payload: GoogleCreateUserRequest) {
  return apiPost<GoogleCreateUserReponse>("/google/oauth/user", payload);
}
