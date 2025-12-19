import type {
  AvatarUploadResponse,
  UpdateProfileRequest,
} from "@/types/profile";
import { apiPatch, apiRequest } from "./api-client";

export async function uploadAvatarImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);
  return apiRequest<AvatarUploadResponse>("/users/avatars", {
    method: "PUT",
    body: formData,
    isMultipart: true,
  });
}

export async function updateUserProfile(payload: UpdateProfileRequest) {
  return apiPatch("/users/@me", payload);
}
