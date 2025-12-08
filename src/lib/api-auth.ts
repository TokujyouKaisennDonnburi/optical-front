import { apiGet, apiPost, OPTICAL_API_URL } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "@/types/auth";

export const AUTH_GOOGLE_LOGIN_URL = "/api/auth/google";

export async function fetchCurrentUser() {
  return apiGet<User>("/users/@me", undefined, OPTICAL_API_URL);
}

export async function login(credentials: LoginRequest) {
  return apiPost<AuthResponse>(
    "/login",
    credentials,
    {
      useAuth: false,
    },
    OPTICAL_API_URL,
  );
}

export async function signup(payload: SignupRequest) {
  return apiPost<AuthResponse>(
    "/register",
    payload,
    {
      useAuth: false,
    },
    OPTICAL_API_URL,
  );
}

export async function logout() {
  return apiPost("/api/auth/logout");
}
