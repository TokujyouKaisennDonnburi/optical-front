import { apiGet, apiPost } from "@/lib/api-client";
import type {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
} from "@/types/auth";

export const AUTH_GOOGLE_LOGIN_URL = "/api/auth/google";

export async function fetchCurrentUser() {
  return apiGet<User>("/api/auth/me");
}

export async function login(credentials: LoginRequest) {
  return apiPost<AuthResponse>("/api/auth/login", credentials, {
    useAuth: false,
  });
}

export async function signup(payload: SignupRequest) {
  return apiPost<AuthResponse>("/api/auth/signup", payload, { useAuth: false });
}

export async function logout() {
  return apiPost("/api/auth/logout");
}
